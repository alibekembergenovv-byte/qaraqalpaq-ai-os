import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await prisma.newsItem.deleteMany({ where: { sourceId: params.id } }); // cascade delete news
    await prisma.source.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
