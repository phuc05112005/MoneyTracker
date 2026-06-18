"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";
import { resetPasswordSchema } from "@/lib/validators";

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: params.get("token") ?? "", password: "", confirmPassword: "" }
  });

  async function submit(values: z.infer<typeof resetPasswordSchema>) {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast({ title: "Reset failed", description: data.error ?? "Please try again." });
      return;
    }
    toast({ title: "Password updated", description: "You can log in with your new password." });
    router.push("/login");
  }

  return (
    <Card className="w-full max-w-md border-white/40 bg-card/85 shadow-soft backdrop-blur-xl">
      <CardHeader><CardTitle className="text-2xl">Choose new password</CardTitle></CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
          <input type="hidden" {...form.register("token")} />
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" placeholder="At least 8 characters" {...form.register("password")} />
            {form.formState.errors.password ? <p className="text-xs text-destructive">{form.formState.errors.password.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input type="password" placeholder="Repeat your password" {...form.register("confirmPassword")} />
            {form.formState.errors.confirmPassword ? <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p> : null}
          </div>
          <Button className="w-full" type="submit"><KeyRound className="h-4 w-4" />Update password</Button>
          <p className="text-center text-sm text-muted-foreground"><Link className="text-primary" href="/login">Back to login</Link></p>
        </form>
      </CardContent>
    </Card>
  );
}
