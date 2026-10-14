import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { prisma } from "@/lib/db";

const parser = new Parser();

const BANNED_KEYWORDS = ["binance", "crypto", "bitcoin", "web3", "token", "nft", "coinbase"];

function containsBannedKeyword(text: string) {
  const lowerText = text.toLowerCase();
  return BANNED_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

export async function POST() {
  try {
    // Fetch all active sources from the DB!
    const sources = await prisma.source.findMany({ where: { active: true } });

    // ⚡ Bolt Optimization: Batch Database Insertions
    // Why: Previously used N+1 queries (findUnique and create in a loop), causing database bottleneck.
    // What: Gather all valid news items and insert them with a single createMany call.
    // Impact: Significantly reduces database roundtrips and connection overhead.
    // Measurement: Compare execution time of scraping endpoint before and after this optimization.
    const newsItemsToInsert = [];
    const uniqueUrls = new Set<string>();

    for (const source of sources) {
      if (!source.rssUrl && !source.url) continue;
      const targetUrl = source.rssUrl || source.url; // Use rssUrl if available, else url
      
      try {
        const feed = await parser.parseURL(targetUrl as string);

        // Parse up to 5 items from each feed
        for (const item of feed.items.slice(0, 5)) {
          if (!item.link || !item.title) continue;
          
          // Strict filtering based on user's requirements
          if (containsBannedKeyword(item.title) || (item.contentSnippet && containsBannedKeyword(item.contentSnippet))) {
            continue; // Skip irrelevant/crypto news
          }

          // Prevent duplicates within the current batch to avoid createMany errors
          if (uniqueUrls.has(item.link)) continue;
          uniqueUrls.add(item.link);

          newsItemsToInsert.push({
            title: item.title,
            url: item.link,
            sourceId: source.id,
            summary: (item.contentSnippet || "").substring(0, 300),
            publicationDate: item.pubDate ? new Date(item.pubDate) : new Date(),
            author: item.creator || "Author",
            aiScore: Math.floor(Math.random() * 20) + 80, // Score 80-100 since it's targeted
            status: "NEW"
          });
        }
      } catch (e) {
        console.error("Error scraping feed:", targetUrl, e);
      }
    }

    let addedCount = 0;
    if (newsItemsToInsert.length > 0) {
      // Execute batch insert, skipping any that already exist in DB
      const result = await prisma.newsItem.createMany({
        data: newsItemsToInsert,
        skipDuplicates: true
      });
      addedCount = result.count;
    }

    return NextResponse.json({ success: true, added: addedCount });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json({ success: false, error: "Failed to scrape" }, { status: 500 });
  }
}
