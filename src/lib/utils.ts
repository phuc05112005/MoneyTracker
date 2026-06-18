import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function currency(value: number | string, code = "USD") {
  const localeMap: Record<string, string> = {
    USD: "en-US",
    VND: "vi-VN",
    EUR: "de-DE",
    JPY: "ja-JP",
    GBP: "en-GB"
  };
  return new Intl.NumberFormat(localeMap[code] ?? "en-US", {
    style: "currency",
    currency: code,
    maximumFractionDigits: code === "VND" || code === "JPY" ? 0 : 2
  }).format(Number(value));
}

export function prettyDate(date: string | Date) {
  return format(new Date(date), "MMM d, yyyy");
}

export function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escapeCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(","))].join("\n");
}
