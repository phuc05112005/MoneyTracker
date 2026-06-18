import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const [income, expense, recent, budget, categoryExpense] = await Promise.all([
    prisma.income.aggregate({ where: { userId: auth.userId }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { userId: auth.userId }, _sum: { amount: true } }),
    Promise.all([
      prisma.income.findMany({ where: { userId: auth.userId }, orderBy: { date: "desc" }, take: 5 }),
      prisma.expense.findMany({ where: { userId: auth.userId }, orderBy: { date: "desc" }, take: 5 })
    ]),
    prisma.budget.findUnique({ where: { userId_month_year: { userId: auth.userId, month: now.getMonth() + 1, year: now.getFullYear() } } }),
    prisma.expense.groupBy({ by: ["category"], where: { userId: auth.userId }, _sum: { amount: true } })
  ]);
  const monthExpense = await prisma.expense.aggregate({
    where: { userId: auth.userId, date: { gte: monthStart, lt: monthEnd } },
    _sum: { amount: true }
  });
  const totalIncome = Number(income._sum.amount ?? 0);
  const totalExpense = Number(expense._sum.amount ?? 0);
  const monthSpent = Number(monthExpense._sum.amount ?? 0);
  const mergedRecent = [
    ...recent[0].map((item) => ({ ...item, amount: Number(item.amount), type: "Income" })),
    ...recent[1].map((item) => ({ ...item, amount: Number(item.amount), type: "Expense" }))
  ]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 6);
  return NextResponse.json({
    totalIncome,
    totalExpense,
    totalBalance: totalIncome - totalExpense,
    savingRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0,
    recent: mergedRecent,
    budget,
    spent: monthSpent,
    categories: categoryExpense.map((item) => ({ name: item.category, value: Number(item._sum.amount ?? 0) }))
  });
}
