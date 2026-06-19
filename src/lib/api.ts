import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { userId: session.user.id };
}

export function paginationParams(url: string) {
  const params = new URL(url).searchParams;
  const page = Math.max(Number(params.get("page") ?? 1), 1);
  const take = Math.min(Math.max(Number(params.get("take") ?? 10), 1), 50);
  const skip = (page - 1) * take;
  const search = params.get("search") ?? "";
  const from = params.get("from");
  const to = params.get("to");
  const sort = params.get("sort") === "amount" ? "amount" : "date";
  const direction = params.get("direction") === "asc" ? "asc" : "desc";
  return { page, take, skip, search, from, to, sort, direction };
}

export function dateFilter(from: string | null, to: string | null) {
  if (!from && !to) return undefined;
  let toDate: Date | undefined;
  if (to) {
    // Use the start of the next day so the entire "to" day is included
    toDate = new Date(to);
    toDate.setDate(toDate.getDate() + 1);
  }
  return {
    ...(from ? { gte: new Date(from) } : {}),
    ...(toDate ? { lt: toDate } : {})
  };
}
