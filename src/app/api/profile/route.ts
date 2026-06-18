import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";
import { profileSchema } from "@/lib/validators";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, fullname: true, name: true, email: true, avatar: true, image: true, currency: true, createdAt: true }
  });
  return NextResponse.json(user ? { ...user, fullname: user.fullname || user.name || "", avatar: user.avatar || user.image || "" } : null);
}

export async function PUT(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const body = await request.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  
  // Explicitly update the user with the new currency and other fields
  const user = await prisma.user.update({
    where: { id: auth.userId },
    data: {
      fullname: parsed.data.fullname,
      name: parsed.data.fullname,
      email: parsed.data.email,
      avatar: parsed.data.avatar || null,
      image: parsed.data.avatar || null,
      currency: parsed.data.currency // Ensure this is being updated
    }
  });
  
  return NextResponse.json({ 
    id: user.id, 
    fullname: user.fullname, 
    email: user.email, 
    avatar: user.avatar, 
    currency: user.currency 
  });
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const body = await request.json();
  if (!body.password || String(body.password).length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  await prisma.user.update({ where: { id: auth.userId }, data: { password: await bcrypt.hash(body.password, 12) } });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  await prisma.user.delete({ where: { id: auth.userId } });
  return NextResponse.json({ ok: true });
}
