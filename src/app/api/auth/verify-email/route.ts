import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const loginUrl = new URL("/login", getAppUrl());

  if (!token) {
    loginUrl.searchParams.set("verified", "invalid");
    return NextResponse.redirect(loginUrl);
  }

  const verificationToken = await prisma.verificationToken.findUnique({ where: { token } });

  if (!verificationToken || verificationToken.expires < new Date()) {
    if (verificationToken) {
      await prisma.verificationToken.deleteMany({ where: { token } });
    }
    loginUrl.searchParams.set("verified", "invalid");
    return NextResponse.redirect(loginUrl);
  }

  const user = await prisma.user.findUnique({ where: { email: verificationToken.identifier } });
  if (!user) {
    await prisma.verificationToken.deleteMany({ where: { token } });
    loginUrl.searchParams.set("verified", "invalid");
    return NextResponse.redirect(loginUrl);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() }
    }),
    prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token
        }
      }
    })
  ]);

  loginUrl.searchParams.set("verified", "success");
  return NextResponse.redirect(loginUrl);
}
