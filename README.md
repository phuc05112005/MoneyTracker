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
   Email verification and password reset also require SMTP variables:

```bash
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="..."
SMTP_PASSWORD="..."
MAIL_FROM="MoneyTracker <no-reply@example.com>"
```

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

`/forgot-password` sends a password reset link by email. New accounts must verify their email address before credentials login is allowed.

## VPS Deployment

1. Provision PostgreSQL on the VPS or a managed PostgreSQL provider.
2. Set production environment variables:

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-a-long-random-secret"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="..."
SMTP_PASSWORD="..."
MAIL_FROM="MoneyTracker <no-reply@your-domain.com>"
```

3. Install dependencies, generate Prisma, run migrations, and build:

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
```

4. Start the standalone Next.js server:

```bash
node .next/standalone/server.js
```

Use a process manager such as PM2 or a systemd service, then place Nginx/Caddy in front of the app with HTTPS.

### VPS With Docker Compose

Copy `.env.production.example` to `.env.production`, update every secret, then run:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

For the bundled PostgreSQL container, `DATABASE_URL` should use host `postgres` and port `5432`, not `localhost`.
