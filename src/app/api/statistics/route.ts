import { NextResponse } from "next/server";
import { format, subDays, subMonths, subYears } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";

export async function GET(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const params = new URL(request.url).searchParams;
  const range = params.get("range") ?? "6m";
  const from = params.get("from");
  const to = params.get("to");
  const now = new Date();
  const start = from ? new Date(from) :
    range === "7d" ? subDays(now, 7) : range === "30d" ? subDays(now, 30) : range === "1y" ? subYears(now, 1) : subMonths(now, 6);
  const end = to ? new Date(to) : now;
  const [incomes, expenses, categories] = await Promise.all([
    prisma.income.findMany({ where: { userId: auth.userId, date: { gte: start, lte: end } }, orderBy: { date: "asc" } }),
    prisma.expense.findMany({ where: { userId: auth.userId, date: { gte: start, lte: end } }, orderBy: { date: "asc" } }),
    prisma.expense.groupBy({ by: ["category"], where: { userId: auth.userId, date: { gte: start, lte: end } }, _sum: { amount: true } })
  ]);
  const byMonth = new Map<string, { month: string; income: number; expense: number; saving: number }>();
  for (const item of incomes) {
    const month = format(item.date, "MMM yyyy");
    const row = byMonth.get(month) ?? { month, income: 0, expense: 0, saving: 0 };
    row.income += Number(item.amount);
    row.saving = row.income - row.expense;
    byMonth.set(month, row);
  }
  for (const item of expenses) {
    const month = format(item.date, "MMM yyyy");
    const row = byMonth.get(month) ?? { month, income: 0, expense: 0, saving: 0 };
    row.expense += Number(item.amount);
    row.saving = row.income - row.expense;
    byMonth.set(month, row);
  }
  const monthlyArray = Array.from(byMonth.values()).sort((a, b) => {
    return new Date(a.month).getTime() - new Date(b.month).getTime();
  });
  return NextResponse.json({
    monthly: monthlyArray,
    categories: categories.map((item) => ({ name: item.category, value: Number(item._sum.amount ?? 0) }))
  });
}
