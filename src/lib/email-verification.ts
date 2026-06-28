import crypto from "crypto";
import { addHours } from "date-fns";
import { buildEmailTemplate, getAppUrl, sendMail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

export async function sendVerificationEmail(email: string) {
  const token = crypto.randomBytes(32).toString("hex");

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier: email } }),
    prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: addHours(new Date(), 24)
      }
    })
  ]);

  const verifyUrl = `${getAppUrl()}/api/auth/verify-email?token=${token}`;

  await sendMail({
    to: email,
    subject: "Verify your MoneyTracker account",
    text: `Welcome to MoneyTracker. Verify your account within 24 hours: ${verifyUrl}`,
    html: buildEmailTemplate(
      "Verify your MoneyTracker account",
      "Welcome to MoneyTracker. Please confirm your email address to finish creating your account.",
      "Verify email",
      verifyUrl
    )
  });
}
