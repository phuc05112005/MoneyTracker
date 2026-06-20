import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";

export async function GET(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const wallets = await prisma.wallet.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "asc" }
  });
  return NextResponse.json(wallets);
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const data = await request.json();
  const wallet = await prisma.wallet.create({
    data: { ...data, userId: auth.userId }
  });
  return NextResponse.json(wallet, { status: 201 });
}
