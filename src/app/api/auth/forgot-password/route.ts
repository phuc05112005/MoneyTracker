import crypto from "crypto";
import { addMinutes } from "date-fns";
import { NextResponse } from "next/server";
import { buildEmailTemplate, getAppUrl, sendMail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators";

export async function POST(request: Request) {
  let resetTokenId: string | null = null;

  try {
    const parsed = forgotPasswordSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user) {
      return NextResponse.json({ message: "If the email exists, a reset link will be sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const resetToken = await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expires: addMinutes(new Date(), 30)
      }
    });
    resetTokenId = resetToken.id;

    const resetUrl = `${getAppUrl()}/reset-password?token=${token}`;
    await sendMail({
      to: user.email,
      subject: "Reset your MoneyTracker password",
      text: `Reset your MoneyTracker password within 30 minutes: ${resetUrl}`,
      html: buildEmailTemplate(
        "Reset your MoneyTracker password",
        "We received a request to reset your password. This link expires in 30 minutes.",
        "Reset password",
        resetUrl
      )
    });

    return NextResponse.json({
      message: "If the email exists, a reset link will be sent."
    });
  } catch (error) {
    if (resetTokenId) {
      await prisma.passwordResetToken.deleteMany({ where: { id: resetTokenId } }).catch(() => undefined);
    }

    const message = error instanceof Error && error.message.includes("Missing mail environment variables")
      ? "Mail is not configured. Please set SMTP variables before sending reset emails."
      : "Could not send reset email. Please try again later.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
