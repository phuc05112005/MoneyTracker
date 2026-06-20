"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3, Loader2, Plus, Search, Trash2, X, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
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

type RecordItem = { id: string; amount: string | number; categoryId: string; walletId: string; categoryName: string; walletName: string; description: string; date: string };
type FinanceFormValues = { amount: number; categoryId: string; walletId: string; description: string; date: string };

type Category = { id: string; name: string; type: string };
type WalletData = { id: string; name: string };

export function FinanceRecordManager({
  title,
  endpoint,
  schema,
}: {
  title: string;
  endpoint: string;
  schema: z.ZodTypeAny;
}) {
  const toast = useToast();
  const { money } = useCurrency();
  const { t } = useI18n();
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const { items, total, loading, query, setQuery, reload } = useApiList<RecordItem>(endpoint);

  useEffect(() => {
    let isMounted = true;
    const type = title === "Income" ? "INCOME" : "EXPENSE";
    
    Promise.all([
      fetch(`/api/categories?type=${type}`).then(r => r.json()),
      fetch('/api/wallets').then(r => r.json())
    ]).then(([catData, walData]) => {
      if (isMounted) {
        setCategories(catData || []);
        setWallets(walData || []);
      }
    });
    
    return () => { isMounted = false; };
  }, [title]);

  const defaultValues = {
    amount: "" as unknown as number,
    categoryId: "",
    walletId: "",
    description: "",
    date: new Date().toISOString().slice(0, 10)
  };

  const form = useForm<FinanceFormValues>({
    resolver: zodResolver(schema) as Resolver<FinanceFormValues>,
    defaultValues
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
          title: t("editRecord"),
          description: errorData.error?.message ?? "Please check the form and try again.",
          variant: "destructive"
        });
        return;
      }
      toast({ title: editing ? t("editRecord") : t("addRecord") });
      cancelEdit();
      await reload();
    } catch {
      toast({ title: "Unexpected error", description: "An error occurred while saving.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    try {
      const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: t("noRecords") === "Không tìm thấy bản ghi nào." ? "Đã xoá bản ghi" : "Record deleted" });
      await reload();
    } catch {
      toast({ title: "Error", description: "Could not delete record.", variant: "destructive" });
    }
  }

  function startEdit(item: RecordItem) {
    setEditing(item);
    form.reset({
      amount: Number(item.amount),
      categoryId: item.categoryId || "",
      walletId: item.walletId || "",
      description: item.description,
      date: new Date(item.date).toISOString().slice(0, 10)
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditing(null);
    form.reset(defaultValues);
  }

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      {/* Add / Edit Form */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editing ? (
              <>
                <Edit3 className="h-4 w-4 text-primary" />
                {t("editRecord")}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 text-primary" />
                {t("addRecord")}
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
            <div className="space-y-2">
              <Label>{t("amount")}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...form.register("amount", { valueAsNumber: true })}
              />
              {form.formState.errors.amount ? (
                <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
              ) : null}
            </div>

            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label>Ví</Label>
                <Select value={form.watch("walletId")} onValueChange={(value) => form.setValue("walletId", value)}>
                  <SelectTrigger><SelectValue placeholder="Chọn ví..." /></SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>{wallet.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.walletId ? (
                  <p className="text-xs text-destructive">{form.formState.errors.walletId.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>{t("category")}</Label>
                <Select value={form.watch("categoryId")} onValueChange={(value) => form.setValue("categoryId", value)}>
                  <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoryId ? (
                  <p className="text-xs text-destructive">{form.formState.errors.categoryId.message}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("description")}</Label>
              <Input
                placeholder={title === "Income" ? "Monthly salary, bonus..." : "Lunch, grocery, transport..."}
                {...form.register("description")}
              />
              {form.formState.errors.description ? (
                <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>{t("date")}</Label>
              <Input type="date" {...form.register("date")} />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" type="submit" disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> {editing ? t("save") : t("addRecord")}</>
                ) : (
                  editing ? t("save") : t("addRecord")
                )}
              </Button>
              {editing ? (
                <Button variant="outline" type="button" onClick={cancelEdit}>
                  <X className="h-4 w-4" />
                  {t("cancel")}
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader className="gap-4">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>
              {title === "Income" ? t("income") : t("expense")} {t("transactions")}
            </CardTitle>
            <span className="text-sm text-muted-foreground">{total} {t("transactions").toLowerCase()}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={t("search")}
                value={query.search}
                onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })}
              />
            </div>
            <Input
              type="date"
              value={query.from}
              onChange={(e) => setQuery({ ...query, from: e.target.value, page: 1 })}
            />
            <Input
              type="date"
              value={query.to}
              onChange={(e) => setQuery({ ...query, to: e.target.value, page: 1 })}
            />
            <Select
              value={`${query.sort}:${query.direction}`}
              onValueChange={(value) => {
                const [sort, direction] = value.split(":");
                setQuery({ ...query, sort, direction, page: 1 });
              }}
            >
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
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
              {t("noRecords")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-3 pr-4">Ví</th>
                    <th className="pr-4">{t("category")}</th>
                    <th className="pr-4">{t("description")}</th>
                    <th className="pr-4">{t("amount")}</th>
                    <th className="pr-4">{t("date")}</th>
                    <th className="text-right">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-0 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-3 pr-4 font-medium flex items-center gap-1.5"><Wallet className="h-3 w-3 opacity-50"/> {item.walletName}</td>
                      <td className="pr-4 font-medium">{item.categoryName}</td>
                      <td className="pr-4 max-w-[180px] truncate" title={item.description}>{item.description}</td>
                      <td className="pr-4 font-semibold tabular-nums">{money(item.amount)}</td>
                      <td className="pr-4 text-muted-foreground">{prettyDate(item.date)}</td>
                      <td className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(item)}
                          title={t("editRecord")}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(item.id)}
                          title={t("confirmDelete")}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              {totalPages > 0
                ? `${t("page")} ${query.page} ${t("of")} ${totalPages}`
                : ""}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={query.page <= 1}
                onClick={() => setQuery({ ...query, page: query.page - 1 })}
              >
                {t("prev")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={query.page >= totalPages}
                onClick={() => setQuery({ ...query, page: query.page + 1 })}
              >
                {t("next")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
