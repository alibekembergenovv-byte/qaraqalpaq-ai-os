import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOpenAI } from "@/lib/ai/openai";
import { Telegraf } from "telegraf";

export const maxDuration = 60; // 60 seconds limit on Vercel Hobby

export async function GET(req: Request) {
  try {
    // 1. Check if auth header is valid (Vercel Cron secure)
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // In dev mode we can bypass, but in production we protect it
      if (process.env.NODE_ENV === 'production') {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    // 2. We don't scrape here to save time, we assume the user scrapes, OR we can scrape 1 source
    // Let's find one news item that hasn't been generated yet
    const newsItem = await prisma.newsItem.findFirst({
      where: { status: "NEW" },
      orderBy: { createdAt: "desc" }
    });

    if (!newsItem) {
      return NextResponse.json({ message: "No new news items to process." });
    }

    // 3. GENERATE CONTENT
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a specialized Qaraqalpaq AI and Prompt Engineering expert. Write an engaging post for Telegram in Qaraqalpaq language about the provided news. Keep it under 800 characters, use emojis, and focus ONLY on AI, ChatGPT, or Prompt Engineering." },
        { role: "user", content: `Title: ${newsItem.title}\nSummary: ${newsItem.summary}\nSource URL: ${newsItem.url}` }
      ],
      temperature: 0.7,
    });

    let generatedText = response.choices[0].message.content || "";
    // Telegram markdown fix
    generatedText = generatedText
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.*?)\*/g, '<i>$1</i>');
    
    // Generate image
    const encodedPrompt = encodeURIComponent(`Futuristic AI technology, prompt engineering, artificial intelligence, highly detailed, cyberpunk style, concept: ${newsItem.title.substring(0, 100)}`);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

    // Save Content
    const content = await prisma.content.create({
      data: {
        newsItemId: newsItem.id,
        title: newsItem.title,
        body: generatedText,
        imageUrl: imageUrl,
        format: "TELEGRAM_POST",
        status: "APPROVED"
      }
    });

    // Mark news as CURATED
    await prisma.newsItem.update({
      where: { id: newsItem.id },
      data: { status: "CURATED" }
    });

    // 4. PUBLISH TO TELEGRAM
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_CHANNEL_ID;

    if (!botToken || !channelId) {
      return NextResponse.json({ message: "Generated but not published: Telegram credentials missing.", contentId: content.id });
    }

    const bot = new Telegraf(botToken);
    
    const finalCaption = `${generatedText}\n\n🔗 <a href="${newsItem.url}">Toliq oqiw</a>\n\n🤖 @alibek_embergenov`;

    await bot.telegram.sendPhoto(channelId, imageUrl, {
      caption: finalCaption,
      parse_mode: "HTML"
    });

    // Mark as published
    await prisma.content.update({
      where: { id: content.id },
      data: { status: "PUBLISHED" }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Successfully generated and published an article!", 
      title: content.title 
    });

  } catch (error: any) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
