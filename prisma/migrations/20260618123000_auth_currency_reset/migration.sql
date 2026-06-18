-- AlterTable
ALTER TABLE "User" ALTER COLUMN "fullname" SET DEFAULT '';
ALTER TABLE "User" ADD COLUMN "name" TEXT;
ALTER TABLE "User" ADD COLUMN "emailVerified" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "image" TEXT;
ALTER TABLE "User" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';

-- Backfill NextAuth-compatible display name from the existing fullname field.
UPDATE "User" SET "name" = "fullname" WHERE "name" IS NULL AND "fullname" IS NOT NULL;

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_token_idx" ON "PasswordResetToken"("userId", "token");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
