"use client";

import { Download, Search } from "lucide-react";
import { useApiList } from "@/hooks/use-api-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from "@/hooks/use-currency";
import { cn, prettyDate, toCsv } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";

type Tx = { id: string; type: string; category: string; description: string; amount: string; date: string };

export default function TransactionsPage() {
  const { money } = useCurrency();
  const { t } = useI18n();
  const { items, total, query, setQuery } = useApiList<Tx>("/api/transactions");
  function exportCsv() {
    const blob = new Blob([toCsv(items)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "moneytracker-transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold tracking-tight">{t("transactions")}</CardTitle>
          <Button onClick={exportCsv} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            {t("exportCsv")}
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-6">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder={t("search")} value={query.search} onChange={(event) => setQuery({ ...query, search: event.target.value })} />
          </div>
          <Input type="date" value={query.from} onChange={(event) => setQuery({ ...query, from: event.target.value })} />
          <Input type="date" value={query.to} onChange={(event) => setQuery({ ...query, to: event.target.value })} />
          <Select value={query.type ?? "All"} onValueChange={(value) => setQuery({ ...query, type: value, page: 1 })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">{t("allTypes")}</SelectItem>
              <SelectItem value="Income">{t("income")}</SelectItem>
              <SelectItem value="Expense">{t("expense")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={`${query.sort}:${query.direction}`} onValueChange={(value) => {
            const [sort, direction] = value.split(":");
            setQuery({ ...query, sort, direction });
          }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date:desc">{t("newest")}</SelectItem>
              <SelectItem value="date:asc">{t("oldest")}</SelectItem>
              <SelectItem value="amount:desc">{t("amountHigh")}</SelectItem>
              <SelectItem value="amount:asc">{t("amountLow")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground"><tr className="border-b"><th className="py-3">Type</th><th>{t("category")}</th><th>{t("description")}</th><th>{t("amount")}</th><th>{t("date")}</th></tr></thead>
            <tbody>{items.map((item) => (
              <tr key={`${item.type}-${item.id}`} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="py-3">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    item.type === "Income" ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  )}>
                    {item.type === "Income" ? t("income") : t("expense")}
                  </span>
                </td>
                <td>{item.category}</td>
                <td className="font-medium">{item.description}</td>
                <td className={cn("font-bold", item.type === "Income" ? "text-teal-600" : "text-orange-600")}>
                  {item.type === "Income" ? "+" : "-"}{money(item.amount)}
                </td>
                <td className="text-muted-foreground">{prettyDate(item.date)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{total} {t("transactions")}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={query.page <= 1} onClick={() => setQuery({ ...query, page: query.page - 1 })}>Prev</Button>
            <Button variant="outline" size="sm" disabled={query.page * 10 >= total} onClick={() => setQuery({ ...query, page: query.page + 1 })}>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
