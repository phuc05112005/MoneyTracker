"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import type { z } from "zod";
import { useApiList } from "@/hooks/use-api-list";
import { useCurrency } from "@/hooks/use-currency";
import { prettyDate } from "@/lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "./ui/toaster";
import { useI18n } from "@/hooks/use-i18n";

type RecordItem = { id: string; amount: string | number; category: string; description: string; date: string };
type FinanceFormValues = { amount: number; category: string; description: string; date: string };

export function FinanceRecordManager({
  title,
  endpoint,
  schema,
  categories
}: {
  title: string;
  endpoint: string;
  schema: z.ZodTypeAny;
  categories: readonly string[];
}) {
  const toast = useToast();
  const { money } = useCurrency();
  const { t } = useI18n();
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { items, total, loading, query, setQuery, reload } = useApiList<RecordItem>(endpoint);
  const form = useForm<FinanceFormValues>({
    resolver: zodResolver(schema) as Resolver<FinanceFormValues>,
    defaultValues: { amount: 0, category: categories[0], description: "", date: new Date().toISOString().slice(0, 10) }
  });

  async function submit(values: FinanceFormValues) {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        amount: Number(values.amount),
        date: new Date(values.date).toISOString()
      };
      const response = await fetch(editing ? `${endpoint}/${editing.id}` : endpoint, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast({ 
          title: "Could not save record", 
          description: errorData.error?.message ?? "Please check the form and try again.",
          variant: "destructive"
        });
        return;
      }
      toast({ title: editing ? t("editRecord") : t("addRecord") });
      setEditing(null);
      form.reset({ amount: 0, category: categories[0], description: "", date: new Date().toISOString().slice(0, 10) });
      await reload();
    } catch (error) {
      toast({ title: "Unexpected error", description: "An error occurred while saving.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    toast({ title: "Record deleted" });
    await reload();
  }

  function startEdit(item: RecordItem) {
    setEditing(item);
    form.reset({
      amount: Number(item.amount),
      category: item.category,
      description: item.description,
      date: new Date(item.date).toISOString().slice(0, 10)
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>{editing ? t("editRecord") : t("addRecord")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
            <div className="space-y-2">
              <Label>{t("amount")}</Label>
              <Input type="number" step="0.01" placeholder="0.00" {...form.register("amount")} />
              {form.formState.errors.amount ? <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label>{t("category")}</Label>
              <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("description")}</Label>
              <Input placeholder={title === "Income" ? "Monthly salary..." : "Lunch, grocery..."} {...form.register("description")} />
              {form.formState.errors.description ? <p className="text-xs text-destructive">{form.formState.errors.description.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label>{t("date")}</Label>
              <Input type="date" {...form.register("date")} />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" type="submit" disabled={submitting}>
                {submitting ? "..." : editing ? t("save") : t("addRecord")}
              </Button>
              {editing ? (
                <Button variant="outline" type="button" onClick={() => {
                  setEditing(null);
                  form.reset({ amount: 0, category: categories[0], description: "", date: new Date().toISOString().slice(0, 10) });
                }}>{t("cancel")}</Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="gap-4">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>{title === "Income" ? t("income") : t("expense")} {t("transactions")}</CardTitle>
            <span className="text-sm text-muted-foreground">{total} total</span>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder={t("search")} value={query.search} onChange={(event) => setQuery({ ...query, search: event.target.value, page: 1 })} />
            </div>
            <Input type="date" value={query.from} onChange={(event) => setQuery({ ...query, from: event.target.value })} />
            <Input type="date" value={query.to} onChange={(event) => setQuery({ ...query, to: event.target.value })} />
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
          {loading ? <Skeleton className="h-64" /> : items.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">{t("noRecords")}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-3">{t("category")}</th><th>{t("description")}</th><th>{t("amount")}</th><th>{t("date")}</th><th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 font-medium">{item.category}</td>
                      <td>{item.description}</td>
                      <td>{money(item.amount)}</td>
                      <td>{prettyDate(item.date)}</td>
                      <td className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(item)}><Edit3 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" disabled={query.page <= 1} onClick={() => setQuery({ ...query, page: query.page - 1 })}>Prev</Button>
            <Button variant="outline" disabled={query.page * 10 >= total} onClick={() => setQuery({ ...query, page: query.page + 1 })}>Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
