"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { loginSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [hasGoogle, setHasGoogle] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const form = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "", remember: false } });

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((response) => response.json())
      .then((providers) => setHasGoogle(Boolean(providers.google)))
      .catch(() => setHasGoogle(false));
  }, []);

  async function submit(values: z.infer<typeof loginSchema>) {
    const result = await signIn("credentials", { email: values.email, password: values.password, redirect: false });
    if (result?.error) {
      toast({ title: "Login failed", description: "Email or password is incorrect." });
      return;
    }
    router.push("/dashboard");
  }

  return (
    <Card className="w-full max-w-md border-white/40 bg-card/85 shadow-soft backdrop-blur-xl">
      <CardHeader><CardTitle className="text-2xl">Login to MoneyTracker</CardTitle></CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="you@example.com" {...form.register("email")} />
            {form.formState.errors.email ? <p className="text-xs text-destructive">{form.formState.errors.email.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} className="pr-10" {...form.register("password")} />
              <button type="button" className="absolute right-3 top-3 text-muted-foreground" onClick={() => setShowPassword((value) => !value)} aria-label="Show password">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password ? <p className="text-xs text-destructive">{form.formState.errors.password.message}</p> : null}
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" {...form.register("remember")} /> Remember me</label>
            <Link href="/forgot-password" className="text-primary">Forgot password?</Link>
          </div>
          <Button className="w-full" type="submit"><LogIn className="h-4 w-4" />Login</Button>
          <Button
            className="w-full"
            type="button"
            variant="outline"
            onClick={() => hasGoogle ? signIn("google", { callbackUrl: "/dashboard" }) : toast({ title: "Google login is not configured", description: "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env, then restart the dev server." })}
          >
            Google login
          </Button>
          <p className="text-center text-sm text-muted-foreground">No account? <Link className="text-primary" href="/register">Register</Link></p>
        </form>
      </CardContent>
    </Card>
  );
}
