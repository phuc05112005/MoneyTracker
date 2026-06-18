"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { CurrencyProvider } from "@/hooks/use-currency";
import { I18nProvider } from "@/hooks/use-i18n";
import { ToasterProvider } from "./ui/toaster";
import { ProgressBar } from "./progress-bar";
import { Suspense } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <I18nProvider>
          <CurrencyProvider>
            <ToasterProvider>
              <Suspense fallback={null}>
                <ProgressBar />
              </Suspense>
              {children}
            </ToasterProvider>
          </CurrencyProvider>
        </I18nProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
