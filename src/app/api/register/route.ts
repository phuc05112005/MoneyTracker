import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Please check the registration form." }, { status: 400 });

    const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (exists) return NextResponse.json({ error: "Email is already registered." }, { status: 409 });

    const user = await prisma.user.create({
      data: {
        fullname: parsed.data.fullname,
        name: parsed.data.fullname,
        email: parsed.data.email,
        password: await bcrypt.hash(parsed.data.password, 12)
      }
    });

    return NextResponse.json({ id: user.id, email: user.email, fullname: user.fullname }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Database is not ready. Please configure DATABASE_URL and run Prisma migration." },
      { status: 500 }
    );
  }
}
