"use client";

import { Save, Trash2, User } from "lucide-react";
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
  const form = useForm<Profile>({ defaultValues: { fullname: "", email: "", avatar: "", currency: "USD" } });
  const passwordForm = useForm<{ password: string }>({ defaultValues: { password: "" } });

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
        toast({ title: "Profile updated" });
      } else {
        throw new Error();
      }
    } catch {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(values: { password: string }) {
    setChanging(true);
    try {
      await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      passwordForm.reset();
      toast({ title: "Password changed" });
    } finally {
      setChanging(false);
    }
  }

  async function deleteAccount() {
    if (!confirm("Are you SURE you want to delete your account? This action cannot be undone and all your data will be lost.")) return;
    await fetch("/api/profile", { method: "DELETE" });
    await signOut({ callbackUrl: "/register" });
  }

  function uploadAvatar(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => form.setValue("avatar", String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card><CardHeader><CardTitle className="text-xl font-bold tracking-tight">{t("profile")}</CardTitle></CardHeader><CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(save)}>
          <div className="flex items-center gap-4">
            {form.watch("avatar") ? (
              <img src={form.watch("avatar")} alt="Avatar" className="h-20 w-20 rounded-full border-2 border-primary/20 object-cover shadow-sm" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-secondary-foreground"><User className="h-8 w-8 opacity-20" /></div>
            )}
            <div className="flex-1 space-y-1">
              <Label className="text-xs uppercase tracking-wider opacity-70">Upload Avatar</Label>
              <Input type="file" className="h-9 text-xs" accept="image/*" onChange={(event) => uploadAvatar(event.target.files?.[0])} />
            </div>
          </div>
          <div className="space-y-2"><Label>{t("amount")} URL</Label><Input placeholder="https://..." {...form.register("avatar")} /></div>
          <div className="space-y-2"><Label>Full Name</Label><Input placeholder="Nguyen Van A" {...form.register("fullname")} /></div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="you@example.com" {...form.register("email")} /></div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={form.watch("currency")} onValueChange={(value) => form.setValue("currency", value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{currencies.map((item) => <SelectItem key={item.code} value={item.code}>{item.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button disabled={saving} className="w-full sm:w-auto"><Save className="h-4 w-4" />{saving ? "..." : t("save")}</Button>
        </form>
      </CardContent></Card>
      <div className="space-y-6">
        <Card><CardHeader><CardTitle className="text-lg">Change Password</CardTitle></CardHeader><CardContent>
          <form className="space-y-4" onSubmit={passwordForm.handleSubmit(changePassword)}>
            <div className="space-y-2"><Label>New Password</Label><Input type="password" placeholder="At least 8 characters" {...passwordForm.register("password")} /></div>
            <Button variant="secondary" className="w-full sm:w-auto" disabled={changing}>{changing ? "..." : "Change password"}</Button>
          </form>
        </CardContent></Card>
        <Card className="border-destructive/20 bg-destructive/5"><CardHeader><CardTitle className="text-lg text-destructive">Delete Account</CardTitle></CardHeader><CardContent className="space-y-4">
          <p className="text-sm text-destructive/80">This permanently removes your account and finance records. This action is irreversible.</p>
          <Button variant="destructive" onClick={deleteAccount} className="w-full sm:w-auto"><Trash2 className="h-4 w-4" />Delete account</Button>
        </CardContent></Card>
      </div>
    </div>
  );
}
