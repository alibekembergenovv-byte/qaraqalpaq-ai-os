import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const news = await prisma.newsItem.findMany({
      orderBy: { createdAt: "desc" },
      include: { source: true },
      take: 50
    });
    return NextResponse.json(news);
  } catch (error) { console.error(error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
