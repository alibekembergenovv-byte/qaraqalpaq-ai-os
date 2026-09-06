import { NextResponse } from "next/server";
import { Telegraf } from "telegraf";

export async function GET(req: Request) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) return NextResponse.json({ error: "Missing bot token" });

    const bot = new Telegraf(botToken);
    
    const host = req.headers.get("host");
    const protocol = host?.includes("localhost") ? "http" : "https";
    const webhookUrl = `${protocol}://${host}/api/telegram/webhook`;

    await bot.telegram.setWebhook(webhookUrl);
    return NextResponse.json({ success: true, webhookUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
