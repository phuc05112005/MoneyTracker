"use client";

import { Plus, Edit3, Trash2, Loader2, X, Tags } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toaster";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/hooks/use-i18n";

type Category = { id: string; name: string; type: "INCOME" | "EXPENSE"; color: string };

export default function CategoriesPage() {
  const toast = useToast();
  const { t } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const form = useForm<Category>({
    defaultValues: { name: "", type: "EXPENSE", color: "#3b82f6" }
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch {
      toast({ title: t("loadCategoryError"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  async function submit(values: Category) {
    setSubmitting(true);
    try {
      const endpoint = editing ? `/api/categories/${editing.id}` : "/api/categories";
      const res = await fetch(endpoint, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      if (!res.ok) throw new Error();
      toast({ title: editing ? t("categoryUpdated") : t("categoryAdded") });
      cancelEdit();
      await fetchCategories();
    } catch {
      toast({ title: t("saveCategoryError"), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: t("categoryDeleted") });
      await fetchCategories();
    } catch {
      toast({ title: t("deleteCategoryError"), variant: "destructive" });
    }
  }

  function startEdit(item: Category) {
    setEditing(item);
    form.reset({ name: item.name, type: item.type, color: item.color });
  }

  function cancelEdit() {
    setEditing(null);
    form.reset({ name: "", type: "EXPENSE", color: "#3b82f6" });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* Form */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editing ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editing ? t("editCategory") : t("addCategory")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
            <div className="space-y-2">
              <Label>{t("categoryName")}</Label>
              <Input placeholder={t("categoryNamePlaceholder")} {...form.register("name", { required: true })} />
            </div>
            
            <div className="space-y-2">
              <Label>{t("type")}</Label>
              <Select value={form.watch("type")} onValueChange={(value: "INCOME"|"EXPENSE") => form.setValue("type", value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">{t("expense")}</SelectItem>
                  <SelectItem value="INCOME">{t("income")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("color")}</Label>
              <div className="flex gap-2">
                <Input type="color" className="w-16 h-10 p-1" {...form.register("color")} />
                <Input className="flex-1" type="text" {...form.register("color")} />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? t("saveChanges") : t("addCategory")}
              </Button>
              {editing && (
                <Button variant="outline" type="button" onClick={cancelEdit}>
                  <X className="h-4 w-4 mr-2" /> {t("cancel")}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("categoryList")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center p-10 text-muted-foreground border border-dashed rounded-lg">
              {t("noCategories")}
            </div>
          ) : (
            <div className="grid gap-3">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: cat.color + '20' }}>
                      <Tags className="h-4 w-4" style={{ color: cat.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{cat.type === "INCOME" ? t("income") : t("expense")}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(cat)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(cat.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
