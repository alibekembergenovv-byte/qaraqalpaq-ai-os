import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const content = await prisma.content.findUnique({
      where: { id: params.id },
      include: { newsItem: { include: { source: true } } }
    });

    if (!content) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(content);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { body, imageUrl } = await req.json();
    const content = await prisma.content.update({
      where: { id: params.id },
      data: { body, imageUrl }
    });
    return NextResponse.json(content);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
