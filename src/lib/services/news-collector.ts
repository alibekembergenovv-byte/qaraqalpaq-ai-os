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

    // Deduplicate items by URL to avoid batch insertion conflicts
    const itemsByUrl = new Map();
    for (const item of feed.items) {
      if (!item.link || !item.title) continue;
      if (!itemsByUrl.has(item.link)) {
        itemsByUrl.set(item.link, item);
      }
    }

    const uniqueItems = Array.from(itemsByUrl.values());
    if (uniqueItems.length === 0) {
      return { success: true, added: 0 };
    }

    // Check which URLs already exist
    const urls = uniqueItems.map(item => item.link);
    const existingItems = await prisma.newsItem.findMany({
      where: { url: { in: urls } },
      select: { url: true }
    });
    const existingUrls = new Set(existingItems.map(item => item.url));

    const newItems = uniqueItems.filter(item => !existingUrls.has(item.link));

    let addedCount = 0;
    if (newItems.length > 0) {
      const dataToInsert = newItems.map(item => ({
        title: item.title,
        url: item.link,
        sourceId: source.id,
        publicationDate: item.isoDate ? new Date(item.isoDate) : new Date(),
        author: item.creator || item.author,
        summary: item.contentSnippet || item.content,
        categoryId: source.categoryId,
        status: "NEW",
      }));

      const result = await prisma.newsItem.createMany({
        data: dataToInsert,
        skipDuplicates: true
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
