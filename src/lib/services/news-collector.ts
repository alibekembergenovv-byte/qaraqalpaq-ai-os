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

    // ⚡ Bolt: Performance Improvement - Batch database insertions
    // By using createMany with skipDuplicates: true, we avoid N+1 query problems.
    // Application-level deduplication using a Set ensures we don't try to insert duplicates within the same batch.

    // 1. Application-level deduplication
    const uniqueItemsMap = new Map();
    for (const item of feed.items) {
      if (!item.link || !item.title) continue;
      // Use URL as unique identifier
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

    const uniqueItems = Array.from(uniqueItemsMap.values());

    let addedCount = 0;

    if (uniqueItems.length > 0) {
      // 2. Batch insertion with skipDuplicates
      const result = await prisma.newsItem.createMany({
        data: uniqueItems,
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
