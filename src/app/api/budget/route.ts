import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";
import { budgetSchema } from "@/lib/validators";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const [budget, spent] = await Promise.all([
    prisma.budget.findUnique({ where: { userId_month_year: { userId: auth.userId, month, year } } }),
    prisma.expense.aggregate({
      where: { userId: auth.userId, date: { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) } },
      _sum: { amount: true }
    })
  ]);
  return NextResponse.json({ budget, spent: Number(spent._sum.amount ?? 0) });
}

export async function PUT(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const parsed = budgetSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const budget = await prisma.budget.upsert({
    where: { userId_month_year: { userId: auth.userId, month: parsed.data.month, year: parsed.data.year } },
    create: { ...parsed.data, userId: auth.userId },
    update: { amount: parsed.data.amount }
  });
  return NextResponse.json(budget);
}
