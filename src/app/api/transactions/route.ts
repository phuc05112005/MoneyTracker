import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dateFilter, paginationParams, requireUser } from "@/lib/api";

export async function GET(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { search, from, to, page, take, sort, direction } = paginationParams(request.url);
  const type = new URL(request.url).searchParams.get("type") ?? "All";
  const where = { userId: auth.userId, description: { contains: search, mode: "insensitive" as const }, date: dateFilter(from, to) };
  const [incomes, expenses] = await Promise.all([
    type === "Expense" ? Promise.resolve([]) : prisma.income.findMany({ where }),
    type === "Income" ? Promise.resolve([]) : prisma.expense.findMany({ where })
  ]);
  const allItems = [
    ...incomes.map((item) => ({ ...item, type: "Income" })),
    ...expenses.map((item) => ({ ...item, type: "Expense" }))
  ].sort((a, b) => {
    if (sort === "amount") {
      return direction === "asc" ? Number(a.amount) - Number(b.amount) : Number(b.amount) - Number(a.amount);
    }
    return direction === "asc" ? +new Date(a.date) - +new Date(b.date) : +new Date(b.date) - +new Date(a.date);
  });
  return NextResponse.json({ items: allItems.slice((page - 1) * take, page * take), total: allItems.length });
}
