"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { registerSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";

export function RegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const form = useForm<z.infer<typeof registerSchema>>({ resolver: zodResolver(registerSchema), defaultValues: { fullname: "", email: "", password: "", confirmPassword: "" } });

  async function submit(values: z.infer<typeof registerSchema>) {
    const response = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Please try again." }));
      toast({ title: "Registration failed", description: data.error ?? "Please try again." });
      return;
    }
    toast({ title: "Account created", description: "You can log in now." });
    router.push("/login");
  }

  return (
    <Card className="w-full max-w-md border-white/40 bg-card/85 shadow-soft backdrop-blur-xl">
      <CardHeader><CardTitle className="text-2xl">Create your account</CardTitle></CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
          <div className="space-y-2"><Label>Full Name</Label><Input placeholder="Nguyen Van A" {...form.register("fullname")} />{form.formState.errors.fullname ? <p className="text-xs text-destructive">{form.formState.errors.fullname.message}</p> : null}</div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="you@example.com" {...form.register("email")} />{form.formState.errors.email ? <p className="text-xs text-destructive">{form.formState.errors.email.message}</p> : null}</div>
          <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="At least 8 characters" {...form.register("password")} />{form.formState.errors.password ? <p className="text-xs text-destructive">{form.formState.errors.password.message}</p> : null}</div>
          <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" placeholder="Repeat your password" {...form.register("confirmPassword")} />{form.formState.errors.confirmPassword ? <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p> : null}</div>
          <Button className="w-full" type="submit"><UserPlus className="h-4 w-4" />Register</Button>
          <p className="text-center text-sm text-muted-foreground">Already registered? <Link className="text-primary" href="/login">Login</Link></p>
        </form>
      </CardContent>
    </Card>
  );
}
