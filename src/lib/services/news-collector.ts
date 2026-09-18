import Parser from "rss-parser";
import { prisma } from "../db";

const parser = new Parser();

export async function collectNewsFromSource(sourceId: string) {
  try {
    const source = await prisma.source.findUnique({
      where: { id: sourceId },
    });

    if (!source || !source.rssUrl || !source.active) {
      console.log(`Skipping source ${sourceId}`);
      return;
    }

    const feed = await parser.parseURL(source.rssUrl);
    console.log(`Fetched ${feed.items.length} items from ${source.name}`);

    // Extract valid items
    const validItems = feed.items.filter((item) => item.link && item.title);

    // Prepare data for batch insert
    const dataToInsert = validItems.map((item) => ({
      title: item.title as string,
      url: item.link as string,
      sourceId: source.id,
      publicationDate: item.isoDate ? new Date(item.isoDate) : new Date(),
      author: item.creator || item.author,
      summary: item.contentSnippet || item.content,
      categoryId: source.categoryId,
      status: "NEW",
    }));

    // Perform batch insert skipping duplicates
    // This optimization replaces O(n) separate database queries with O(1) query.
    // NOTE: Prisma's createMany with skipDuplicates returns the count of inserted rows.
    const createResult = await prisma.newsItem.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    });

    const addedCount = createResult.count;

    // Update last checked
    await prisma.source.update({
      where: { id: source.id },
      data: { lastChecked: new Date() },
    });

    return { success: true, added: addedCount };
  } catch (error) {
    console.error(`Error collecting news for source ${sourceId}:`, error);
    
    // Log error to system logs
    await prisma.systemLog.create({
      data: {
        level: "ERROR",
        source: "SCRAPER",
        message: `Failed to fetch RSS feed for source ${sourceId}`,
        details: error instanceof Error ? error.message : String(error),
      }
    });
    
    return { success: false, error };
  }
}

export async function collectAllActiveSources() {
  const sources = await prisma.source.findMany({
    where: { active: true },
  });

  const results = [];
  for (const source of sources) {
    const result = await collectNewsFromSource(source.id);
    results.push({ source: source.name, ...result });
  }

  return results;
}
