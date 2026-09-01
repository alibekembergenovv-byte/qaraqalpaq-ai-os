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

    for (const item of feed.items) {
      if (!item.link || !item.title) continue;

      // Duplicate check (simple URL check for Phase 2, Phase 8 will have semantic search)
      const existing = await prisma.newsItem.findUnique({
        where: { url: item.link },
      });

      if (!existing) {
        await prisma.newsItem.create({
          data: {
            title: item.title,
            url: item.link,
            sourceId: source.id,
            publicationDate: item.isoDate ? new Date(item.isoDate) : new Date(),
            author: item.creator || item.author,
            summary: item.contentSnippet || item.content,
            categoryId: source.categoryId,
            status: "NEW",
          },
        });
        addedCount++;
      }
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
