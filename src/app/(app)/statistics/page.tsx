"use client";

import { useEffect, useState } from "react";
import { ExpensePie, IncomeExpenseLine, SavingArea } from "@/components/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/hooks/use-i18n";

type Stats = { monthly: unknown[]; categories: { name: string; value: number }[] };

export default function StatisticsPage() {
  const [range, setRange] = useState("6m");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();
  const [data, setData] = useState<Stats>({ monthly: [], categories: [] });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ range });
    if (range === "custom" && from) params.set("from", from);
    if (range === "custom" && to) params.set("to", to);
    fetch(`/api/statistics?${params}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [range, from, to]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">{t("statistics")}</h2>
        <Select value={range} onValueChange={(val) => { setRange(val); setFrom(""); setTo(""); }}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">{t("last7d")}</SelectItem>
            <SelectItem value="30d">{t("last30d")}</SelectItem>
            <SelectItem value="6m">{t("last6m")}</SelectItem>
            <SelectItem value="1y">{t("lastYear")}</SelectItem>
            <SelectItem value="custom">{t("customRange")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {range === "custom" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("dateFrom")}</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("dateTo")}</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-[320px] w-full rounded-xl" />
          <div className="grid gap-6 xl:grid-cols-2">
            <Skeleton className="h-[320px] w-full rounded-xl" />
            <Skeleton className="h-[320px] w-full rounded-xl" />
          </div>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("income")} vs {t("expense")}</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeExpenseLine data={data.monthly} />
            </CardContent>
          </Card>
          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("expense")} {t("category")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpensePie data={data.categories} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("savingTrend")}</CardTitle>
              </CardHeader>
              <CardContent>
                <SavingArea data={data.monthly} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
