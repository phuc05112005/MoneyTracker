"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CreditCard, LayoutDashboard, LogOut, PiggyBank, ReceiptText, TrendingDown, TrendingUp, User, Languages, Wallet, Tags } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useI18n } from "@/hooks/use-i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { type Language } from "@/lib/i18n";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data } = useSession();
  const { lang, setLang, t } = useI18n();

  const nav = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/income", label: t("income"), icon: TrendingUp },
    { href: "/expense", label: t("expense"), icon: TrendingDown },
    { href: "/budget", label: t("budget"), icon: PiggyBank },
    { href: "/wallets", label: "Quản lý Ví", icon: Wallet },
    { href: "/categories", label: "Danh mục", icon: Tags },
    { href: "/statistics", label: t("statistics"), icon: BarChart3 },
    { href: "/transactions", label: t("transactions"), icon: ReceiptText },
    { href: "/profile", label: t("profile"), icon: User }
  ];

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-card/80 backdrop-blur-xl lg:block">
        <div className="flex h-16 items-center gap-3 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold tracking-tight">MoneyTracker</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground opacity-70">Personal finance</p>
          </div>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-secondary active:scale-[0.98]",
                  active ? "bg-secondary text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 transition-transform duration-200 group-hover:scale-110", active && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/75 px-4 backdrop-blur-xl sm:px-6">
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{t("welcome")}</p>
            <h1 className="text-lg font-bold tracking-tight">{data?.user?.name ?? "User"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Select value={lang} onValueChange={(val) => setLang(val as Language)}>
              <SelectTrigger className="h-9 w-[110px] border-none bg-transparent hover:bg-secondary/50 focus:ring-0">
                <Languages className="mr-2 h-4 w-4 opacity-70" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="ko">한국어</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
            <ThemeToggle />
            <Button variant="outline" size="icon" className="h-9 w-9 border-none bg-transparent hover:bg-secondary/50" aria-label="Sign out" onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl animate-in fade-in zoom-in-95 duration-300 px-4 py-6 pb-24 sm:px-6 lg:pb-6">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex gap-1 overflow-x-auto border-t bg-card/90 p-2 backdrop-blur-xl lg:hidden">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} prefetch={true} className={cn("flex min-w-20 flex-col items-center gap-1 rounded-md py-2 text-[10px] font-medium transition-all active:scale-90", pathname === item.href ? "bg-secondary text-primary" : "text-muted-foreground")}>
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
