import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email-verification";
import { prisma } from "@/lib/prisma";
import { resendVerificationSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const parsed = resendVerificationSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user || user.emailVerified) {
      return NextResponse.json({ message: "If the account needs verification, a new email will be sent." });
    }

    await sendVerificationEmail(user.email);

    return NextResponse.json({ message: "If the account needs verification, a new email will be sent." });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("Missing mail environment variables")
      ? "Mail is not configured. Please check SMTP settings."
      : "Could not send verification email. Please try again later.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
