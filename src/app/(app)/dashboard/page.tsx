"use client";

import { ArrowDownRight, ArrowUpRight, PiggyBank, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { ExpensePie, IncomeExpenseLine } from "@/components/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/use-currency";
import { cn, prettyDate } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";

type Summary = {
  totalBalance: number; totalIncome: number; totalExpense: number; savingRate: number;
  recent: { id: string; type: string; category: string; description: string; amount: string; date: string }[];
  budget: { amount: string } | null; spent: number; categories: { name: string; value: number }[];
};

export default function DashboardPage() {
  const { money } = useCurrency();
  const { t } = useI18n();
  const [summary, setSummary] = useState<Summary | null>(null);
  useEffect(() => { fetch("/api/summary").then((res) => res.json()).then(setSummary); }, []);
  
  const stats = [
    { key: "totalBalance", label: t("totalBalance"), icon: Wallet, color: "from-teal-500 to-cyan-500" },
    { key: "totalIncome", label: t("totalIncome"), icon: ArrowUpRight, color: "from-emerald-500 to-teal-500" },
    { key: "totalExpense", label: t("totalExpense"), icon: ArrowDownRight, color: "from-orange-500 to-rose-500" },
    { key: "savingRate", label: t("savingRate"), icon: PiggyBank, color: "from-indigo-500 to-violet-500" }
  ] as const;

  const spent = summary?.spent ?? 0;
  const budget = Number(summary?.budget?.amount ?? 0);
  const progress = budget ? (spent / budget) * 100 : 0;
  const chartData = [{ month: "Current", income: summary?.totalIncome ?? 0, expense: summary?.totalExpense ?? 0 }];

  if (!summary) return <Skeleton className="h-[620px]" />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          const value = item.key === "savingRate" ? `${summary[item.key]}%` : money(summary[item.key]);
          return (
            <Card key={item.key} className={`bg-gradient-to-br ${item.color} text-white transition hover:-translate-y-1 hover:shadow-soft`}>
              <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-sm font-medium opacity-90">{item.label}</CardTitle><Icon className="h-5 w-5 opacity-70" /></CardHeader>
              <CardContent><p className="text-3xl font-bold tracking-tight">{value}</p></CardContent>
            </Card>
          );
        })}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card><CardHeader><CardTitle className="text-lg">{t("income")} vs {t("expense")}</CardTitle></CardHeader><CardContent><IncomeExpenseLine data={chartData} /></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">{t("expense")} {t("category")}</CardTitle></CardHeader><CardContent><ExpensePie data={summary.categories} /></CardContent></Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">{t("recentTransactions")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {summary.recent.length ? summary.recent.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex items-center justify-between rounded-xl border bg-card/50 p-4 transition-colors hover:bg-secondary/30">
                <div><p className="font-semibold tracking-tight">{item.description}</p><p className="text-xs text-muted-foreground">{item.type === "Income" ? t("income") : t("expense")} · {item.category} · {prettyDate(item.date)}</p></div>
                <p className={cn("font-bold", item.type === "Income" ? "text-teal-600" : "text-orange-600")}>{item.type === "Income" ? "+" : "-"}{money(item.amount)}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">{t("noRecords")}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">{t("monthlyBudget")}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><p className="text-xs text-muted-foreground uppercase tracking-wider">{t("budget")}</p><p className="text-xl font-bold">{money(budget)}</p></div>
              <div className="space-y-1 text-right"><p className="text-xs text-muted-foreground uppercase tracking-wider">{t("spent")}</p><p className="text-xl font-bold">{money(spent)}</p></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("remaining")}</span><span className="font-bold">{money(budget - spent)}</span></div>
              <Progress value={progress} className="h-2" indicatorClassName={progress > 100 ? "bg-destructive" : "bg-primary"} />
            </div>
            {progress > 100 ? <div className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20">Warning: spending exceeds this month’s budget.</div> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
