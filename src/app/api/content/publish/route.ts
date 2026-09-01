import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { contentId, botToken, channelId } = await req.json();

    const content = await prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!content) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    let bodyData: any = {
      chat_id: channelId,
      text: content.body,
      parse_mode: "HTML" // Switch to HTML which is much more stable in Telegram
    };

    // Convert Markdown to HTML for Telegram manually (bold, italic, links)
    let parsedBody = content.body
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.*?)\*/g, '<i>$1</i>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

    if (content.imageUrl && content.imageUrl.trim() !== "") {
      telegramUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      bodyData = {
        chat_id: channelId,
        photo: content.imageUrl.trim(),
        caption: parsedBody,
        parse_mode: "HTML"
      };
    } else {
      bodyData.text = parsedBody;
    }

    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });

    const data = await telegramResponse.json();

    if (data.ok) {
      await prisma.content.update({
        where: { id: contentId },
        data: { status: "PUBLISHED" }
      });
      return NextResponse.json({ success: true });
    } else {
      console.error("Telegram API Error Response:", data);
      return NextResponse.json({ success: false, error: data.description }, { status: 400 });
    }
  } catch (error) {
    console.error("Telegram Error:", error);
    return NextResponse.json({ success: false, error: "Network error" }, { status: 500 });
  }
}
