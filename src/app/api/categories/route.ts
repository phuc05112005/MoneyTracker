import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";

export async function GET(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  
  const categories = await prisma.category.findMany({
    where: { 
      userId: auth.userId,
      ...(type ? { type: type as any } : {})
    },
    orderBy: { name: "asc" }
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const data = await request.json();
  const category = await prisma.category.create({
    data: { ...data, userId: auth.userId }
  });
  return NextResponse.json(category, { status: 201 });
}
