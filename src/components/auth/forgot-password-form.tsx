"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema } from "@/lib/validators";

export function ForgotPasswordForm() {
  const [resetUrl, setResetUrl] = useState("");
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" }
  });

  async function submit(values: z.infer<typeof forgotPasswordSchema>) {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const data = await response.json();
    setResetUrl(data.resetUrl ?? "");
  }

  return (
    <Card className="w-full max-w-md border-white/40 bg-card/85 shadow-soft backdrop-blur-xl">
      <CardHeader><CardTitle className="text-2xl">Reset password</CardTitle></CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="you@example.com" {...form.register("email")} />
            {form.formState.errors.email ? <p className="text-xs text-destructive">{form.formState.errors.email.message}</p> : null}
          </div>
          <Button className="w-full" type="submit"><Mail className="h-4 w-4" />Create reset link</Button>
          {resetUrl ? (
            <div className="rounded-md border bg-secondary p-3 text-sm">
              <p className="mb-2 font-medium">Local reset link</p>
              <Link className="break-all text-primary" href={resetUrl}>Open reset password page</Link>
            </div>
          ) : null}
          <p className="text-center text-sm text-muted-foreground"><Link className="text-primary" href="/login">Back to login</Link></p>
        </form>
      </CardContent>
    </Card>
  );
}
