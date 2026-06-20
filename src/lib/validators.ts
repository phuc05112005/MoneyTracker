import { z } from "zod";
import { currencies, expenseCategories, incomeCategories } from "./constants";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().default(false)
});

export const registerSchema = z
  .object({
    fullname: z.string().min(2, "Full name is required"),
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export const incomeSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  walletId: z.string().min(1, "Wallet is required"),
  description: z.string().min(2, "Description is required"),
  date: z.coerce.date()
});

export const expenseSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  walletId: z.string().min(1, "Wallet is required"),
  description: z.string().min(2, "Description is required"),
  date: z.coerce.date()
});

export const budgetSchema = z.object({
  amount: z.coerce.number().positive("Budget must be positive"),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100)
});

export const profileSchema = z.object({
  fullname: z.string().min(2),
  email: z.string().email(),
  avatar: z.string().url().optional().or(z.string().startsWith("data:image/")).or(z.literal("")),
  currency: z.enum(currencies.map((item) => item.code) as [string, ...string[]])
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter your account email")
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(12),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });
