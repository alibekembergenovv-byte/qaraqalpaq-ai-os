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
    let addedCount = 0;
    
    // Fetch all active sources from the DB!
    const sources = await prisma.source.findMany({ where: { active: true } });

    const newItemsData = new Map();

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

          // Use a Map to prevent duplicates within the batch payload itself
          if (!newItemsData.has(item.link)) {
            newItemsData.set(item.link, {
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
        }
      } catch (e) {
        console.error("Error scraping feed:", targetUrl, e);
      }
    }

    if (newItemsData.size > 0) {
      const itemsToInsert = Array.from(newItemsData.values());
      const result = await prisma.newsItem.createMany({
        data: itemsToInsert,
        skipDuplicates: true,
      });
      addedCount += result.count;
    }

    return NextResponse.json({ success: true, added: addedCount });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json({ success: false, error: "Failed to scrape" }, { status: 500 });
  }
}
