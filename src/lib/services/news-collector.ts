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

    // ⚡ Bolt: Replaced N+1 findUnique/create loop with batched createMany
    // Why: Batching reduces database roundtrips, significantly improving RSS ingestion speed
    // Impact: Avoids N queries per RSS feed check. Creates are skipped if duplicate URL
    // Measurement: Compare processing time of large RSS feeds before and after this change
    const newItemsData = feed.items
      .filter((item) => item.link && item.title)
      .map((item) => ({
        title: item.title as string,
        url: item.link as string,
        sourceId: source.id,
        publicationDate: item.isoDate ? new Date(item.isoDate) : new Date(),
        author: item.creator || item.author || null,
        summary: item.contentSnippet || item.content || null,
        categoryId: source.categoryId,
        status: "NEW",
      }));

    if (newItemsData.length > 0) {
      const result = await prisma.newsItem.createMany({
        data: newItemsData,
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
