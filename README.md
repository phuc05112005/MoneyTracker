# MoneyTracker

Modern personal finance management app built with Next.js 15, TypeScript, Tailwind CSS, Prisma, PostgreSQL, NextAuth, React Hook Form, Zod, Recharts, and Lucide icons.

## Features

- Email/password and Google authentication
- Forgot password and reset password flow for local development
- Income, expense, budget, transaction, statistics, and profile pages
- Search, sorting, date filters, pagination, CRUD actions, CSV export
- Dashboard cards, recent transactions, budget progress, and charts
- Profile avatar upload and currency selection
- Dark mode, responsive UI, loading skeletons, toast notifications, reusable components

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create an environment file:

```bash
cp .env.example .env
```

3. Update `DATABASE_URL`, `NEXTAUTH_SECRET`, and optional Google OAuth variables in `.env`. The included Docker setup uses PostgreSQL on local port `5433`.

4. Start the included PostgreSQL container:

```bash
docker compose up -d
```

5. Run Prisma migration and generate the client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

6. Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Google Login

Create an OAuth app in Google Cloud Console and set this redirect URL:

```text
http://localhost:3000/api/auth/callback/google
```

Then add the values to `.env`:

```bash
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

Restart `npm run dev`. If these variables are empty, the Google button shows a configuration toast instead of failing silently.

## Forgot Password

For local development, `/forgot-password` creates a reset link directly on screen. In production, replace the reset-link response with a real SMTP/email provider.
