import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dateFilter, paginationParams, requireUser } from "@/lib/api";
import { incomeSchema } from "@/lib/validators";

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
    prisma.income.findMany({ 
      where, 
      orderBy: { [sort]: direction }, 
      take, 
      skip,
      include: { category: true, wallet: true }
    }),
    prisma.income.count({ where })
  ]);
  // Format items to have flattened category name if needed by old components
  const formattedItems = items.map(item => ({
    ...item,
    categoryName: item.category?.name || "Unknown",
    walletName: item.wallet?.name || "Unknown"
  }));
  return NextResponse.json({ items: formattedItems, total });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const parsed = incomeSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.income.create({ data: { ...parsed.data, userId: auth.userId } });
  return NextResponse.json(item, { status: 201 });
}
