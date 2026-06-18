"use client";

import { useEffect, useState } from "react";
import { ExpensePie, IncomeExpenseLine, SavingArea } from "@/components/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/hooks/use-i18n";

type Stats = { monthly: unknown[]; categories: { name: string; value: number }[] };

export default function StatisticsPage() {
  const [range, setRange] = useState("6m");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { t } = useI18n();
  const [data, setData] = useState<Stats>({ monthly: [], categories: [] });
  useEffect(() => {
    const params = new URLSearchParams({ range });
    if (range === "custom" && from) params.set("from", from);
    if (range === "custom" && to) params.set("to", to);
    fetch(`/api/statistics?${params}`).then((res) => res.json()).then(setData);
  }, [range, from, to]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">{t("statistics")}</h2>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="6m">Last 6 months</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {range === "custom" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </div>
      ) : null}
      <Card><CardHeader><CardTitle className="text-lg">{t("income")} vs {t("expense")}</CardTitle></CardHeader><CardContent><IncomeExpenseLine data={data.monthly} /></CardContent></Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-lg">{t("expense")} {t("category")}</CardTitle></CardHeader><CardContent><ExpensePie data={data.categories} /></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">Saving Trend</CardTitle></CardHeader><CardContent><SavingArea data={data.monthly} /></CardContent></Card>
      </div>
    </div>
  );
}
