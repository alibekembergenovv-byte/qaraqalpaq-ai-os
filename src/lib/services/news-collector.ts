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

    // ⚡ Bolt: Use a Set and array to batch inserts and avoid N+1 queries
    const uniqueUrls = new Set<string>();
    const newsItemsToCreate: {
      title: string;
      url: string;
      sourceId: string;
      publicationDate: Date;
      author: string;
      summary: string;
      categoryId: string | null;
      status: string;
    }[] = [];

    for (const item of feed.items) {
      if (!item.link || !item.title) continue;

      // Application-level uniqueness check to prevent batch failure
      if (!uniqueUrls.has(item.link)) {
        uniqueUrls.add(item.link);
        newsItemsToCreate.push({
          title: item.title,
          url: item.link,
          sourceId: source.id,
          publicationDate: item.isoDate ? new Date(item.isoDate) : new Date(),
          author: item.creator || item.author || "Unknown",
          summary: item.contentSnippet || item.content || "",
          categoryId: source.categoryId,
          status: "NEW",
        });
      }
    }

    if (newsItemsToCreate.length > 0) {
      // ⚡ Bolt: Batch insert to fix N+1 query issue
      const result = await prisma.newsItem.createMany({
        data: newsItemsToCreate,
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
