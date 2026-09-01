import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const sources = await prisma.source.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(sources);
}

export async function POST(req: Request) {
  const data = await req.json();
  const source = await prisma.source.create({ data });
  return NextResponse.json(source);
}
