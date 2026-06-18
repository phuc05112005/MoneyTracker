"use client";

import { useCallback, useEffect, useState } from "react";

type QueryState = {
  search: string;
  page: number;
  sort: string;
  direction: string;
  from: string;
  to: string;
  type?: string;
};

export function useApiList<T>(endpoint: string) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<QueryState>({ search: "", page: 1, sort: "date", direction: "desc", from: "", to: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.append(key, String(value));
        }
      });
      const response = await fetch(`${endpoint}?${params}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json().catch(() => ({}));
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch (error) {
      console.error("Failed to load data:", error);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [endpoint, query]);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, total, loading, query, setQuery, reload: load };
}
