"use client";

import {
  Area, AreaChart, CartesianGrid, Cell, Legend,
  Line, LineChart, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from "recharts";
import { chartColors } from "@/lib/constants";

// ─── Income vs Expense Line Chart ─────────────────────────────────────────────
export function IncomeExpenseLine({ data }: { data: unknown[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No data available for this period.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
        <Tooltip
          contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#14b8a6"
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="expense"
          stroke="#f97316"
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Expense Category Pie Chart ────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number;
  innerRadius: number; outerRadius: number; percent: number;
}) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 700 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function ExpensePie({ data }: { data: { name: string; value: number }[] }) {
  const filtered = data.filter((d) => d.value > 0);
  if (!filtered.length) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No expense data available.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Tooltip
          contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
          formatter={(value: number) => [value.toLocaleString(), ""]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Pie
          data={filtered}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={95}
          paddingAngle={3}
          labelLine={false}
          label={CustomLabel as unknown as boolean}
        >
          {filtered.map((_, index) => (
            <Cell key={index} fill={chartColors[index % chartColors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Saving Trend Area Chart ───────────────────────────────────────────────────
export function SavingArea({ data }: { data: unknown[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No data available for this period.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
        <defs>
          <linearGradient id="savingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
        <Tooltip
          contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="saving"
          stroke="#6366f1"
          strokeWidth={2.5}
          fill="url(#savingGrad)"
          dot={{ r: 3, fill: "#6366f1" }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
