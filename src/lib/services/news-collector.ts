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

    let addedCount = 0;
    const newItemsToCreate = [];
    const seenUrls = new Set();

    for (const item of feed.items) {
      if (!item.link || !item.title) continue;

      // Deduplicate within the current payload to prevent Prisma createMany failures
      if (seenUrls.has(item.link)) continue;
      seenUrls.add(item.link);

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

    if (newItemsToCreate.length > 0) {
      // Batch insert instead of N+1 queries, skipping duplicates
      const result = await prisma.newsItem.createMany({
        data: newItemsToCreate,
        skipDuplicates: true
      });
      addedCount += result.count;
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
