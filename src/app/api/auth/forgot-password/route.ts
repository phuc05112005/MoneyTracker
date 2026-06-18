import crypto from "crypto";
import { addMinutes } from "date-fns";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = forgotPasswordSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return NextResponse.json({ message: "If the email exists, a reset link will be created." });
  }

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expires: addMinutes(new Date(), 30)
    }
  });

  const resetUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
  return NextResponse.json({
    message: "Reset link created.",
    resetUrl
  });
}
