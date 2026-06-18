"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { type Language, translations } from "@/lib/i18n";

type I18nContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations["en"]) => string;
};

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  setLang: () => undefined,
  t: (key) => translations["en"][key]
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Language;
    if (saved && translations[saved]) {
      setLang(saved);
    } else {
      const browserLang = navigator.language.split("-")[0] as Language;
      if (translations[browserLang]) {
        setLang(browserLang);
      }
    }
  }, []);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  const t = useMemo(() => (key: keyof typeof translations["en"]) => {
    return translations[lang][key] || translations["en"][key];
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang: handleSetLang, t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
