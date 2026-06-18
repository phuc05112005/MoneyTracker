import { PrismaClient, IncomeCategory, ExpenseCategory } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subDays, subMonths } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  const email = "user@example.com";
  const password = await bcrypt.hash("password123", 12);

  // 1. Clean up
  await prisma.passwordResetToken.deleteMany();
  await prisma.income.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.user.deleteMany({ where: { email } });

  // 2. Create User
  const user = await prisma.user.create({
    data: {
      fullname: "Demo User",
      email,
      password,
      currency: "USD",
    },
  });

  console.log("Created user:", user.email);

  // 3. Create Budget for current month
  const now = new Date();
  await prisma.budget.create({
    data: {
      userId: user.id,
      amount: 5000,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
  });

  // 4. Create Incomes over the last 3 months
  const incomeCats: IncomeCategory[] = ["Salary", "Freelance", "Bonus", "Investment", "Other"];
  for (let i = 0; i < 15; i++) {
    await prisma.income.create({
      data: {
        userId: user.id,
        amount: Math.floor(Math.random() * 2000) + 500,
        category: incomeCats[Math.floor(Math.random() * incomeCats.length)],
        description: `Income source ${i + 1}`,
        date: subDays(now, Math.floor(Math.random() * 90)),
      },
    });
  }

  // 5. Create Expenses over the last 3 months
  const expenseCats: ExpenseCategory[] = ["Food", "Shopping", "Transport", "Entertainment", "Education", "Health", "Bills", "Other"];
  for (let i = 0; i < 40; i++) {
    await prisma.expense.create({
      data: {
        userId: user.id,
        amount: Math.floor(Math.random() * 300) + 10,
        category: expenseCats[Math.floor(Math.random() * expenseCats.length)],
        description: `Expense item ${i + 1}`,
        date: subDays(now, Math.floor(Math.random() * 90)),
      },
    });
  }

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
