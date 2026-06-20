import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const data = await request.json();
  const wallet = await prisma.wallet.updateMany({
    where: { id, userId: auth.userId },
    data: { name: data.name, balance: data.balance ? Number(data.balance) : undefined }
  });
  if (wallet.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const wallet = await prisma.wallet.deleteMany({
    where: { id, userId: auth.userId }
  });
  if (wallet.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
