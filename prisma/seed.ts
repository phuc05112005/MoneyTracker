import { PrismaClient } from "@prisma/client";
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

  // 3. Create default Wallet
  const wallet = await prisma.wallet.create({
    data: {
      userId: user.id,
      name: "Cash",
      balance: 10000,
    }
  });

  // 4. Create default Categories
  const incomeCategoryNames = ["Salary", "Freelance", "Bonus", "Investment", "Other"];
  const expenseCategoryNames = ["Food", "Shopping", "Transport", "Entertainment", "Education", "Health", "Bills", "Other"];

  const incomeCategories = await Promise.all(
    incomeCategoryNames.map((name) =>
      prisma.category.create({
        data: { name, type: "INCOME", color: "#10b981", userId: user.id },
      })
    )
  );

  const expenseCategories = await Promise.all(
    expenseCategoryNames.map((name) =>
      prisma.category.create({
        data: { name, type: "EXPENSE", color: "#ef4444", userId: user.id },
      })
    )
  );

  // 5. Create Budget for current month
  const now = new Date();
  await prisma.budget.create({
    data: {
      userId: user.id,
      amount: 5000,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
  });

  // 6. Create Incomes
  for (let i = 0; i < 15; i++) {
    await prisma.income.create({
      data: {
        userId: user.id,
        amount: Math.floor(Math.random() * 2000) + 500,
        categoryId: incomeCategories[Math.floor(Math.random() * incomeCategories.length)].id,
        walletId: wallet.id,
        description: `Income source ${i + 1}`,
        date: subDays(now, Math.floor(Math.random() * 90)),
      },
    });
  }

  // 7. Create Expenses
  for (let i = 0; i < 40; i++) {
    await prisma.expense.create({
      data: {
        userId: user.id,
        amount: Math.floor(Math.random() * 300) + 10,
        categoryId: expenseCategories[Math.floor(Math.random() * expenseCategories.length)].id,
        walletId: wallet.id,
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
