"use client";

import { FinanceRecordManager } from "@/components/finance-record-manager";
import { expenseCategories } from "@/lib/constants";
import { expenseSchema } from "@/lib/validators";

export default function ExpensePage() {
  return <FinanceRecordManager title="Expense" endpoint="/api/expense" schema={expenseSchema} categories={expenseCategories} />;
}
