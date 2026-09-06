import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOpenAI } from "@/lib/ai/openai";
import { Telegraf } from "telegraf";

export const maxDuration = 60; // 60 seconds limit on Vercel Hobby

export async function GET(req: Request) {
  try {
    // 1. Check if auth header is valid (Vercel Cron secure)
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== "Bearer ${process.env.CRON_SECRET}") {
      if (process.env.NODE_ENV === 'production') {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "news";

    let generatedText = "";
    let imageUrl = "";
    let finalCaption = "";
    let contentId = "";
    
    if (type === "prompt") {
      // B JOLI: AI OZ OYLAP TAWIP PROMPT TIP JAZADI (RSS KEREK EMES)
      const response = await getOpenAI().chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a Qaraqalpaq AI Prompt Engineering expert." },
          { role: "user", content: "Ozin qiyalannan ChatGPT yamasa AI tarmaqlari ushin jada paydali, qiziqli bir 'Prompt secret' (Layfxak) oylap tap ham oni Qaraqalpaq tilinde Telegram post qilib jaz. Posttin uzinligi 700 harripten aspasin. Emojiler qos. Posttin aqirina hesh qanday silteme (url) qospa." }
        ],
        temperature: 0.9,
      });

      generatedText = response.choices[0].message.content || "";
      generatedText = generatedText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>');
      
      const encodedPrompt = encodeURIComponent("AI glowing brain, futuristic prompt engineering, glowing text hologram, highly detailed, cyberpunk style, neon lights");
      imageUrl = "https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true";

      const content = await prisma.content.create({
        data: {
          title: "AI Prompt Layfxak",
          body: generatedText,
          imageUrl: imageUrl,
          format: "TELEGRAM_POST",
          status: "APPROVED"
        }
      });
      contentId = content.id;
      finalCaption = `${generatedText}\n\n🤖 @alibek_embergenov`;

    } else {
      // NORMAL NEWS LOGIC
      const newsItem = await prisma.newsItem.findFirst({
        where: { status: "NEW" },
        orderBy: { createdAt: "desc" }
      });

      if (!newsItem) {
        return NextResponse.json({ message: "No new news items to process." });
      }

      const response = await getOpenAI().chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a specialized Qaraqalpaq AI and Prompt Engineering expert. Write an engaging post for Telegram in Qaraqalpaq language about the provided news. Keep it under 800 characters, use emojis, and focus ONLY on AI, ChatGPT, or Prompt Engineering." },
          { role: "user", content: "Title: ${newsItem.title}\nSummary: ${newsItem.summary}\nSource URL: ${newsItem.url}" }
        ],
        temperature: 0.7,
      });

      generatedText = response.choices[0].message.content || "";
      generatedText = generatedText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>');
      
      const encodedPrompt = encodeURIComponent("Futuristic AI technology, prompt engineering, artificial intelligence, highly detailed, cyberpunk style, concept: ${newsItem.title.substring(0, 100)}");
      imageUrl = "https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true";

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
      contentId = content.id;

      await prisma.newsItem.update({
        where: { id: newsItem.id },
        data: { status: "CURATED" }
      });

      finalCaption = `${generatedText}\n\n🔗 <a href="${newsItem.url}">Toliq oqiw</a>\n\n🤖 @alibek_embergenov`;
    }

    // PUBLISH TO TELEGRAM
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_CHANNEL_ID;

    if (!botToken || !channelId) {
      return NextResponse.json({ message: "Generated but not published: Telegram credentials missing.", contentId });
    }

    const bot = new Telegraf(botToken);
    
    await bot.telegram.sendPhoto(channelId, imageUrl, {
      caption: finalCaption,
      parse_mode: "HTML"
    });

    await prisma.content.update({
      where: { id: contentId },
      data: { status: "PUBLISHED" }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Successfully generated and published!",
      type: type
    });

  } catch (error: any) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
