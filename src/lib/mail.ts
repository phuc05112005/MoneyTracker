import nodemailer from "nodemailer";

type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const requiredSmtpVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "MAIL_FROM"] as const;

export function getAppUrl() {
  return process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "http://localhost:3000";
}

export function assertMailConfigured() {
  const missing = requiredSmtpVars.filter((key) => {
    const value = process.env[key]?.trim();
    return !value || value.includes("CHANGE_ME") || value.includes("example.com");
  });
  if (missing.length > 0) {
    throw new Error(`Missing mail environment variables: ${missing.join(", ")}`);
  }

  if (Number.isNaN(Number(process.env.SMTP_PORT))) {
    throw new Error("Missing mail environment variables: SMTP_PORT");
  }
}

export async function sendMail({ to, subject, text, html }: SendMailInput) {
  assertMailConfigured();

  const port = Number(process.env.SMTP_PORT);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
    html
  });
}

export function buildEmailTemplate(title: string, body: string, actionText: string, actionUrl: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f6f7fb;font-family:Arial,sans-serif;color:#111827;">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:28px;">
        <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;">${title}</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">${body}</p>
        <a href="${actionUrl}" style="display:inline-block;border-radius:8px;background:#111827;color:#ffffff;padding:12px 18px;text-decoration:none;font-weight:700;">${actionText}</a>
        <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#6b7280;">If the button does not work, copy this link into your browser:<br>${actionUrl}</p>
      </div>
    </div>
  </body>
</html>`;
}
