import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const content = await prisma.content.findMany({
      orderBy: { createdAt: "desc" },
      take: 50
    });
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
