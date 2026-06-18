"use client";

import { Area, AreaChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { chartColors } from "@/lib/constants";

export function IncomeExpenseLine({ data }: { data: unknown[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Line type="monotone" dataKey="income" stroke="#14b8a6" strokeWidth={3} /><Line type="monotone" dataKey="expense" stroke="#f97316" strokeWidth={3} /></LineChart>
    </ResponsiveContainer>
  );
}

export function ExpensePie({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart><Tooltip /><Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={4}>{data.map((_, index) => <Cell key={index} fill={chartColors[index % chartColors.length]} />)}</Pie></PieChart>
    </ResponsiveContainer>
  );
}

export function SavingArea({ data }: { data: unknown[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Area type="monotone" dataKey="saving" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} /></AreaChart>
    </ResponsiveContainer>
  );
}
