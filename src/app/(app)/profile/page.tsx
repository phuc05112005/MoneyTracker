"use client";

import { RefreshCw, Save, Trash2, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toaster";
import { useCurrency } from "@/hooks/use-currency";
import { currencies } from "@/lib/constants";
import { useI18n } from "@/hooks/use-i18n";

type Profile = { fullname: string; email: string; avatar?: string; currency: string };

export default function ProfilePage() {
  const toast = useToast();
  const { setCode } = useCurrency();
  const { t } = useI18n();
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);
  const [resetting, setResetting] = useState(false);
  const form = useForm<Profile>({ defaultValues: { fullname: "", email: "", avatar: "", currency: "USD" } });
  const passwordForm = useForm<{ password: string; confirmPassword: string }>({
    defaultValues: { password: "", confirmPassword: "" }
  });

  useEffect(() => {
    let isMounted = true;
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          form.reset({
            fullname: data.fullname || "",
            email: data.email || "",
            avatar: data.avatar || "",
            currency: data.currency || "USD"
          });
        }
      });
    return () => { isMounted = false; };
  }, [form]);

  async function save(values: Profile) {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      if (res.ok) {
        const data = await res.json();
        setCode(data.currency);
        toast({ title: t("save") + " ✓", description: t("profile") });
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? "Failed to update profile");
      }
    } catch (e: unknown) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(values: { password: string; confirmPassword: string }) {
    if (values.password !== values.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (values.password.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    setChanging(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: values.password })
      });
      if (!res.ok) throw new Error();
      passwordForm.reset();
      toast({ title: t("changePassword") + " ✓" });
    } catch {
      toast({ title: "Error", description: "Failed to change password.", variant: "destructive" });
    } finally {
      setChanging(false);
    }
  }

  async function deleteAccount() {
    if (!confirm(t("confirmDeleteAccount"))) return;
    try {
      await fetch("/api/profile", { method: "DELETE" });
      await signOut({ callbackUrl: "/register" });
    } catch {
      toast({ title: "Error", description: "Failed to delete account.", variant: "destructive" });
    }
  }

  async function resetData() {
    if (!confirm("Bạn có chắc chắn muốn xóa tất cả dữ liệu (Thu, Chi, Ngân sách) không? Hành động này không thể hoàn tác.")) return;
    setResetting(true);
    try {
      const res = await fetch("/api/profile/reset", { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Reset dữ liệu thành công ✓" });
      // Reload page to clear caches/UI state
      window.location.reload();
    } catch {
      toast({ title: "Lỗi", description: "Không thể reset dữ liệu.", variant: "destructive" });
    } finally {
      setResetting(false);
    }
  }

  function uploadAvatar(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => form.setValue("avatar", String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-tight">{t("profile")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(save)}>
            {/* Avatar preview + upload */}
            <div className="flex items-center gap-4">
              {form.watch("avatar") ? (
                <img
                  src={form.watch("avatar")}
                  alt="Avatar"
                  className="h-20 w-20 rounded-full border-2 border-primary/20 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <User className="h-8 w-8 opacity-20" />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <Label className="text-xs uppercase tracking-wider opacity-70">{t("uploadAvatar")}</Label>
                <Input
                  type="file"
                  className="h-9 text-xs"
                  accept="image/*"
                  onChange={(e) => uploadAvatar(e.target.files?.[0])}
                />
              </div>
            </div>

            {/* Avatar URL input */}
            <div className="space-y-2">
              <Label>{t("avatarUrl")}</Label>
              <Input placeholder="https://..." {...form.register("avatar")} />
            </div>

            <div className="space-y-2">
              <Label>{t("fullName")}</Label>
              <Input placeholder="Nguyen Van A" {...form.register("fullname")} />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" {...form.register("email")} />
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={form.watch("currency")} onValueChange={(value) => form.setValue("currency", value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {currencies.map((item) => (
                    <SelectItem key={item.code} value={item.code}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button disabled={saving} className="w-full sm:w-auto">
              <Save className="h-4 w-4" />
              {saving ? "..." : t("save")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security & Danger */}
      <div className="space-y-6">
        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("changePassword")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={passwordForm.handleSubmit(changePassword)}>
              <div className="space-y-2">
                <Label>{t("newPassword")}</Label>
                <Input
                  type="password"
                  placeholder="At least 8 characters"
                  {...passwordForm.register("password")}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Re-enter new password"
                  {...passwordForm.register("confirmPassword")}
                />
              </div>
              <Button variant="secondary" className="w-full sm:w-auto" disabled={changing}>
                {changing ? "..." : t("changePassword")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Khu vực nguy hiểm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold mb-1">Reset dữ liệu giao dịch</p>
                <p className="text-sm text-muted-foreground mb-3">Xóa toàn bộ thu nhập, chi phí và ngân sách của bạn (ví dụ: khi đổi đơn vị tiền tệ). Không thể hoàn tác.</p>
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground w-full sm:w-auto" onClick={resetData} disabled={resetting}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${resetting ? "animate-spin" : ""}`} />
                  {resetting ? "Đang xử lý..." : "Reset toàn bộ dữ liệu"}
                </Button>
              </div>
              <div className="border-t border-destructive/20 pt-4 mt-2">
                <p className="text-sm font-semibold mb-1">{t("deleteAccount")}</p>
                <p className="text-sm text-destructive/80 mb-3">{t("confirmDeleteAccount")}</p>
                <Button variant="destructive" onClick={deleteAccount} className="w-full sm:w-auto">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("deleteAccount")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
