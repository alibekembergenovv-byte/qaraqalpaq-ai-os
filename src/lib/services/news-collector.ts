import Parser from "rss-parser";
import { prisma } from "@/lib/db";

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

    // Ensure application-level uniqueness on URLs to prevent batch failures
    const uniqueItemsMap = new Map();
    for (const item of feed.items) {
      if (!item.link || !item.title) continue;
      if (!uniqueItemsMap.has(item.link)) {
        uniqueItemsMap.set(item.link, {
          title: item.title,
          url: item.link,
          sourceId: source.id,
          publicationDate: item.isoDate ? new Date(item.isoDate) : new Date(),
          author: item.creator || item.author,
          summary: item.contentSnippet || item.content,
          categoryId: source.categoryId,
          status: "NEW",
        });
      }
    }

    const uniqueItemsToInsert = Array.from(uniqueItemsMap.values());
    let addedCount = 0;

    if (uniqueItemsToInsert.length > 0) {
      // Use createMany with skipDuplicates to avoid N+1 query bottlenecks
      const result = await prisma.newsItem.createMany({
        data: uniqueItemsToInsert,
        skipDuplicates: true,
      });
      addedCount = result.count;
    }

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
