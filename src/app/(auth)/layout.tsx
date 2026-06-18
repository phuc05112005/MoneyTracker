import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="fixed right-4 top-4"><ThemeToggle /></div>
      {children}
    </main>
  );
}
