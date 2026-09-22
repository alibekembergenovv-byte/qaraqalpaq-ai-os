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

    // Deduplicate feed items by URL to prevent insertion failures caused by duplicates within the batch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uniqueItems = new Map<string, any>();
    for (const item of feed.items) {
      if (item.link && item.title && !uniqueItems.has(item.link)) {
        uniqueItems.set(item.link, item);
      }
    }

    // Check which URLs already exist in the database in a single query
    const urlsToCheck = Array.from(uniqueItems.keys());
    const existingItems = await prisma.newsItem.findMany({
      where: { url: { in: urlsToCheck } },
      select: { url: true }
    });
    const existingUrls = new Set(existingItems.map(item => item.url));

    const newItemsToCreate = [];
    for (const [url, item] of uniqueItems.entries()) {
      if (!existingUrls.has(url)) {
        newItemsToCreate.push({
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

    let addedCount = 0;
    if (newItemsToCreate.length > 0) {
      // ⚡ Bolt: Replaced individual findUnique + create loop with createMany to solve N+1 query bottleneck
      const result = await prisma.newsItem.createMany({
        data: newItemsToCreate,
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
