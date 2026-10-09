import Parser from "rss-parser";
import { PrismaClient } from "@prisma/client";

const parser = new Parser();
const prisma = new PrismaClient();

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

    let addedCount = 0;

    // Ensure application-level uniqueness to avoid failing batch inserts on duplicates
    const validItemsMap = new Map();

    for (const item of feed.items) {
      if (!item.link || !item.title) continue;

      // Duplicate check (simple URL check for Phase 2, Phase 8 will have semantic search)
      // Use a Map to deduplicate items by URL within the batch
      if (!validItemsMap.has(item.link)) {
        validItemsMap.set(item.link, {
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

    const validItems = Array.from(validItemsMap.values());

    if (validItems.length > 0) {
      // Bulk insert the collected items with skipDuplicates enabled
      // This prevents N+1 query bottleneck from finding and creating individual items
      const insertResult = await prisma.newsItem.createMany({
        data: validItems,
        skipDuplicates: true
      });

      addedCount += insertResult.count;
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
