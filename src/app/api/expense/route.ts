import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dateFilter, paginationParams, requireUser } from "@/lib/api";
import { expenseSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { take, skip, search, from, to, sort, direction } = paginationParams(request.url);
  const where = {
    userId: auth.userId,
    description: { contains: search, mode: "insensitive" as const },
    date: dateFilter(from, to)
  };
  const [items, total] = await Promise.all([
    prisma.expense.findMany({ where, orderBy: { [sort]: direction }, take, skip }),
    prisma.expense.count({ where })
  ]);
  return NextResponse.json({ items, total });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const parsed = expenseSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.expense.create({ data: { ...parsed.data, userId: auth.userId } });
  return NextResponse.json(item, { status: 201 });
}
