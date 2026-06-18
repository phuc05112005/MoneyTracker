"use client";

import { FinanceRecordManager } from "@/components/finance-record-manager";
import { incomeCategories } from "@/lib/constants";
import { incomeSchema } from "@/lib/validators";

export default function IncomePage() {
  return <FinanceRecordManager title="Income" endpoint="/api/income" schema={incomeSchema} categories={incomeCategories} />;
}
