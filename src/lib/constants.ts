export const incomeCategories = ["Salary", "Freelance", "Bonus", "Investment", "Other"] as const;
export const expenseCategories = [
  "Food",
  "Shopping",
  "Transport",
  "Entertainment",
  "Education",
  "Health",
  "Bills",
  "Other"
] as const;

export const chartColors = ["#14b8a6", "#6366f1", "#f97316", "#ef4444", "#22c55e", "#eab308", "#06b6d4", "#a855f7"];

export const currencies = [
  { code: "USD", label: "USD - US Dollar", locale: "en-US" },
  { code: "VND", label: "VND - Vietnamese Dong", locale: "vi-VN" },
  { code: "EUR", label: "EUR - Euro", locale: "de-DE" },
  { code: "JPY", label: "JPY - Japanese Yen", locale: "ja-JP" },
  { code: "GBP", label: "GBP - British Pound", locale: "en-GB" }
] as const;
