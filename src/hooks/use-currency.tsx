"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { currency as formatCurrency } from "@/lib/utils";
import { useI18n } from "./use-i18n";

type CurrencyContextValue = {
  code: string;
  setCode: (code: string) => void;
  money: (value: number | string) => string;
};

const CurrencyContext = createContext<CurrencyContextValue>({
  code: "USD",
  setCode: () => undefined,
  money: (value) => formatCurrency(value)
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [code, setCode] = useState("USD");
  const { lang } = useI18n();

  useEffect(() => {
    fetch("/api/profile")
      .then((response) => (response.ok ? response.json() : null))
      .then((profile) => {
        if (profile?.currency) setCode(profile.currency);
      })
      .catch(() => undefined);
  }, []);

  const money = useCallback((value: number | string) => {
    // We can map i18n lang to a preferred locale if needed, 
    // but the utility already has a mapping. We'll use the one from constants.
    return formatCurrency(value, code);
  }, [code]);
  
  const value = useMemo(() => ({ code, setCode, money }), [code, money]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
