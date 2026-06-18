import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = resetPasswordSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Please check your new password." }, { status: 400 });

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
    include: { user: true }
  });

  if (!resetToken || resetToken.usedAt || resetToken.expires < new Date()) {
    return NextResponse.json({ error: "Reset link is invalid or expired." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: await bcrypt.hash(parsed.data.password, 12) }
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() }
    })
  ]);

  return NextResponse.json({ ok: true });
}
