import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  const email = "user@example.com";
  const password = await bcrypt.hash("password123", 12);

  // 1. Clean up chỉ user demo
  await prisma.passwordResetToken.deleteMany();
  await prisma.income.deleteMany({ where: { user: { email } } });
  await prisma.expense.deleteMany({ where: { user: { email } } });
  await prisma.budget.deleteMany({ where: { user: { email } } });
  await prisma.category.deleteMany({ where: { user: { email } } });
  await prisma.wallet.deleteMany({ where: { user: { email } } });
  await prisma.user.deleteMany({ where: { email } });

  // 2. Create Demo User
  const demoUser = await prisma.user.create({
    data: {
      fullname: "Demo User",
      email,
      password,
      currency: "USD",
    },
  });
  console.log("✅ Created demo user:", demoUser.email);

  // 3. Seed categories + wallet cho TẤT CẢ user hiện có (kể cả user tự đăng ký)
  const allUsers = await prisma.user.findMany();

  for (const user of allUsers) {
    // Kiểm tra user đã có category chưa
    const existingCategories = await prisma.category.count({ where: { userId: user.id } });
    const existingWallets = await prisma.wallet.count({ where: { userId: user.id } });

    // Tạo wallet nếu chưa có
    let wallet;
    if (existingWallets === 0) {
      wallet = await prisma.wallet.create({
        data: { userId: user.id, name: "Cash", balance: 10000 },
      });
      console.log(`✅ Created wallet for: ${user.email}`);
    } else {
      wallet = await prisma.wallet.findFirst({ where: { userId: user.id } });
    }

    // Tạo categories nếu chưa có
    if (existingCategories === 0) {
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

      console.log(`✅ Created categories for: ${user.email}`);

      // Tạo sample data chỉ cho demo user
      if (user.email === email && wallet) {
        const now = new Date();

        await prisma.budget.create({
          data: {
            userId: user.id,
            amount: 5000,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
          },
        });

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

        console.log("✅ Created sample income/expense for demo user");
      }
    } else {
      console.log(`⏭️  Skipped ${user.email} — already has categories`);
    }
  }

  console.log("\n🎉 Seed completed!");
  console.log("Demo login: user@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });