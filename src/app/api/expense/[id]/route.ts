import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";
import { expenseSchema } from "@/lib/validators";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = expenseSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.expense.updateMany({ where: { id, userId: auth.userId }, data: parsed.data });
  return NextResponse.json(item);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.expense.deleteMany({ where: { id, userId: auth.userId } });
  return NextResponse.json({ ok: true });
}
