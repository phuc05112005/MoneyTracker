import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: { message: "User not found" } }, { status: 404 });
    }

    // Xóa toàn bộ Income, Expense, Budget của user này
    await prisma.$transaction([
      prisma.income.deleteMany({ where: { userId: user.id } }),
      prisma.expense.deleteMany({ where: { userId: user.id } }),
      prisma.budget.deleteMany({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({ message: "Data reset successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: error.message || "Something went wrong" } },
      { status: 500 }
    );
  }
}
