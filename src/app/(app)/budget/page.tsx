"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toaster";
import { useCurrency } from "@/hooks/use-currency";
import { budgetSchema } from "@/lib/validators";
import { useI18n } from "@/hooks/use-i18n";

export default function BudgetPage() {
  const toast = useToast();
  const { money } = useCurrency();
  const { t } = useI18n();
  const now = new Date();
  const [spent, setSpent] = useState(0);
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { amount: 0, month: now.getMonth() + 1, year: now.getFullYear() }
  });

  useEffect(() => {
    fetch("/api/budget")
      .then((res) => res.json())
      .then((data) => {
        setSpent(data.spent ?? 0);
        if (data.budget) {
          form.reset({
            amount: Number(data.budget.amount),
            month: data.budget.month,
            year: data.budget.year
          });
        }
      })
      .catch(console.error)
      .finally(() => setInitialLoading(false));
  }, [form]);

  const amount = Number(form.watch("amount") ?? 0);
  const progress = amount > 0 ? Math.min((spent / amount) * 100, 200) : 0;
  const isOver = progress > 100;

  async function submit(values: z.infer<typeof budgetSchema>) {
    setSaving(true);
    try {
      const response = await fetch("/api/budget", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      if (!response.ok) throw new Error("Failed to save budget");
      toast({ title: t("save") + " ✓", description: t("monthlyBudget") });
    } catch {
      toast({ title: "Error", description: "Could not save budget", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("monthlyBudget")}</CardTitle>
        </CardHeader>
        <CardContent>
          {initialLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-24" />
            </div>
          ) : (
            <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
              <div className="space-y-2">
                <Label>{t("budget")} {t("amount")}</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="5000"
                  {...form.register("amount")}
                />
                {form.formState.errors.amount && (
                  <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t("month")}</Label>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    {...form.register("month", { valueAsNumber: true })}
                  />
                  {form.formState.errors.month && (
                    <p className="text-xs text-destructive">{form.formState.errors.month.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t("year")}</Label>
                  <Input
                    type="number"
                    {...form.register("year", { valueAsNumber: true })}
                  />
                  {form.formState.errors.year && (
                    <p className="text-xs text-destructive">{form.formState.errors.year.message}</p>
                  )}
                </div>
              </div>
              <Button className="w-full" disabled={saving}>
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> {t("save")}</>
                ) : (
                  <><Save className="h-4 w-4" /> {t("save")}</>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{t("budgetOverview")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {initialLoading ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border bg-card/50 p-6 transition-colors hover:bg-secondary/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("budget")}</p>
                  <p className="text-2xl font-bold tracking-tight">{money(amount)}</p>
                </div>
                <div className="rounded-xl border bg-card/50 p-6 transition-colors hover:bg-secondary/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("spent")}</p>
                  <p className={`text-2xl font-bold tracking-tight ${isOver ? "text-destructive" : ""}`}>
                    {money(spent)}
                  </p>
                </div>
                <div className="rounded-xl border bg-card/50 p-6 transition-colors hover:bg-secondary/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("remaining")}</p>
                  <p className={`text-2xl font-bold tracking-tight ${isOver ? "text-destructive" : "text-primary"}`}>
                    {money(amount - spent)}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("progress")}</span>
                  <span className={`font-bold ${isOver ? "text-destructive" : ""}`}>
                    {Math.round(Math.min((spent / (amount || 1)) * 100, 100))}%
                  </span>
                </div>
                <Progress
                  value={Math.min(progress, 100)}
                  className="h-3"
                  indicatorClassName={isOver ? "bg-destructive" : "bg-primary"}
                />
              </div>
              {isOver && (
                <p className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm font-medium text-destructive">
                  {t("budgetExceeded")}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
