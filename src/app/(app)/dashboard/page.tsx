"use client";

import { ArrowDownRight, ArrowUpRight, PiggyBank, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ExpensePie, IncomeExpenseLine } from "@/components/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/use-currency";
import { cn, prettyDate } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";

type Summary = {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  savingRate: number;
  recent: { id: string; type: string; category: string; description: string; amount: string; date: string }[];
  budget: { amount: string } | null;
  spent: number;
  categories: { name: string; value: number }[];
};

export default function DashboardPage() {
  const { money } = useCurrency();
  const { t } = useI18n();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/summary")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setSummary)
      .catch(() => setError(true));
  }, []);

  const stats = [
    { key: "totalBalance", label: t("totalBalance"), icon: Wallet, color: "from-teal-500 to-cyan-500" },
    { key: "totalIncome", label: t("totalIncome"), icon: ArrowUpRight, color: "from-emerald-500 to-teal-500" },
    { key: "totalExpense", label: t("totalExpense"), icon: ArrowDownRight, color: "from-orange-500 to-rose-500" },
    { key: "savingRate", label: t("savingRate"), icon: PiggyBank, color: "from-indigo-500 to-violet-500" }
  ] as const;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-16 text-center">
        <p className="text-muted-foreground">Failed to load dashboard data.</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Skeleton className="h-[320px] rounded-xl" />
          <Skeleton className="h-[320px] rounded-xl" />
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <Skeleton className="h-[280px] rounded-xl" />
          <Skeleton className="h-[280px] rounded-xl" />
        </div>
      </div>
    );
  }

  const spent = summary.spent ?? 0;
  const budget = Number(summary.budget?.amount ?? 0);
  const progress = budget > 0 ? (spent / budget) * 100 : 0;
  const isOver = progress > 100;
  // Chart uses actual per-month data from summary; for dashboard show current month totals
  const chartData = [{ month: "Current", income: summary.totalIncome, expense: summary.totalExpense }];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          const value = item.key === "savingRate" ? `${summary[item.key]}%` : money(summary[item.key]);
          return (
            <Card key={item.key} className={`bg-gradient-to-br ${item.color} text-white transition hover:-translate-y-1 hover:shadow-lg`}>
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium opacity-90">{item.label}</CardTitle>
                <Icon className="h-5 w-5 opacity-70" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tracking-tight">{value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("income")} vs {t("expense")}</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeExpenseLine data={chartData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("expense")} {t("category")}</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.categories.length > 0 ? (
              <ExpensePie data={summary.categories} />
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                {t("noRecords")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent + Budget */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg">{t("recentTransactions")}</CardTitle>
            <Link href="/transactions" className="text-xs text-primary hover:underline">
              {t("transactions")} →
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.recent.length ? summary.recent.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-center justify-between rounded-xl border bg-card/50 p-4 transition-colors hover:bg-secondary/30"
              >
                <div>
                  <p className="font-semibold tracking-tight">{item.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.type === "Income" ? t("income") : t("expense")} · {item.category} · {prettyDate(item.date)}
                  </p>
                </div>
                <p className={cn("font-bold tabular-nums", item.type === "Income" ? "text-teal-600" : "text-orange-600")}>
                  {item.type === "Income" ? "+" : "-"}{money(item.amount)}
                </p>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">{t("noRecords")}</p>
            )}
          </CardContent>
        </Card>

        {/* Monthly Budget */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg">{t("monthlyBudget")}</CardTitle>
            <Link href="/budget" className="text-xs text-primary hover:underline">
              {t("budget")} →
            </Link>
          </CardHeader>
          <CardContent className="space-y-6">
            {budget === 0 ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <p className="text-sm text-muted-foreground">No budget set for this month.</p>
                <Link href="/budget" className="text-sm font-medium text-primary hover:underline">
                  Set budget →
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("budget")}</p>
                    <p className="text-xl font-bold">{money(budget)}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("spent")}</p>
                    <p className={`text-xl font-bold ${isOver ? "text-destructive" : ""}`}>{money(spent)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("remaining")}</span>
                    <span className={`font-bold ${isOver ? "text-destructive" : ""}`}>{money(budget - spent)}</span>
                  </div>
                  <Progress
                    value={Math.min(progress, 100)}
                    className="h-2"
                    indicatorClassName={isOver ? "bg-destructive" : "bg-primary"}
                  />
                </div>
                {isOver && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20">
                    {t("budgetExceeded")}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
