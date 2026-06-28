import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email-verification";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  let createdUserId: string | null = null;

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Please check the registration form." }, { status: 400 });

    const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (exists?.emailVerified) return NextResponse.json({ error: "Email is already registered." }, { status: 409 });
    if (exists) {
      await sendVerificationEmail(exists.email);
      return NextResponse.json({ email: exists.email, verificationEmailSent: true });
    }

    const user = await prisma.user.create({
      data: {
        fullname: parsed.data.fullname,
        name: parsed.data.fullname,
        email: parsed.data.email,
        password: await bcrypt.hash(parsed.data.password, 12)
      }
    });
    createdUserId = user.id;

    await sendVerificationEmail(user.email);

    return NextResponse.json({ id: user.id, email: user.email, fullname: user.fullname, verificationEmailSent: true }, { status: 201 });
  } catch (error) {
    if (createdUserId) {
      await prisma.user.deleteMany({ where: { id: createdUserId, emailVerified: null } }).catch(() => undefined);
    }

    const message = error instanceof Error && error.message.includes("Missing mail environment variables")
      ? "Mail is not configured. Please set SMTP variables before registering accounts."
      : "Database or mail service is not ready. Please check DATABASE_URL, SMTP settings, and Prisma migration.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
