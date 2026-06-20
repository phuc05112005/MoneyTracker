"use client";

import { Wallet as WalletIcon, Plus, Edit3, Trash2, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";
import { useCurrency } from "@/hooks/use-currency";
import { useI18n } from "@/hooks/use-i18n";
import { Skeleton } from "@/components/ui/skeleton";

type Wallet = { id: string; name: string; balance: number | string };

export default function WalletsPage() {
  const toast = useToast();
  const { money } = useCurrency();
  const { t } = useI18n();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<Wallet | null>(null);

  const form = useForm<Wallet>({
    defaultValues: { name: "", balance: 0 }
  });

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wallets");
      const data = await res.json();
      setWallets(data);
    } catch {
      toast({ title: "Lỗi khi tải danh sách Ví", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  async function submit(values: Wallet) {
    setSubmitting(true);
    try {
      const payload = { ...values, balance: Number(values.balance) };
      const endpoint = editing ? `/api/wallets/${editing.id}` : "/api/wallets";
      const res = await fetch(endpoint, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      toast({ title: editing ? "Đã cập nhật Ví" : "Đã thêm Ví mới" });
      cancelEdit();
      await fetchWallets();
    } catch {
      toast({ title: "Lỗi khi lưu Ví", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    try {
      const res = await fetch(`/api/wallets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Đã xóa Ví" });
      await fetchWallets();
    } catch {
      toast({ title: "Không thể xóa Ví", variant: "destructive" });
    }
  }

  function startEdit(item: Wallet) {
    setEditing(item);
    form.reset({ name: item.name, balance: item.balance });
  }

  function cancelEdit() {
    setEditing(null);
    form.reset({ name: "", balance: 0 });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* Form */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editing ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editing ? "Sửa Ví" : "Thêm Ví mới"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
            <div className="space-y-2">
              <Label>Tên Ví</Label>
              <Input placeholder="Ví dụ: Tiền mặt, Vietcombank, Momo..." {...form.register("name", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Số dư ban đầu</Label>
              <Input type="number" step="0.01" {...form.register("balance", { valueAsNumber: true })} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Lưu thay đổi" : "Thêm Ví"}
              </Button>
              {editing && (
                <Button variant="outline" type="button" onClick={cancelEdit}>
                  <X className="h-4 w-4 mr-2" /> Hủy
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Ví</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : wallets.length === 0 ? (
            <div className="text-center p-10 text-muted-foreground border border-dashed rounded-lg">
              Chưa có ví nào. Hãy tạo một ví mới!
            </div>
          ) : (
            <div className="grid gap-4">
              {wallets.map((wallet) => (
                <div key={wallet.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <WalletIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-base">{wallet.name}</p>
                      <p className="text-sm text-muted-foreground font-medium tabular-nums">{money(wallet.balance)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(wallet)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(wallet.id)}>
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
