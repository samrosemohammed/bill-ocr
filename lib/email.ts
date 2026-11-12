import nodemailer from "nodemailer";

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    })
  : null;

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function codeEmail(opts: { intro: string; code: string }) {
  const note =
    "It expires in 5 minutes. If you didn't request it, ignore this email. Never share this code with anyone.";
  const text = `${opts.intro}\n\nYour code: ${opts.code}\n\n${note}`;
  const html = `<p>${escapeHtml(opts.intro)}</p><p style="font-size:28px;letter-spacing:6px;font-weight:700">${escapeHtml(opts.code)}</p><p style="color:#666;font-size:12px">${escapeHtml(note)}</p>`;
  return { text, html };
}

export async function sendEmail(msg: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  if (!transporter) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n--- EMAIL to ${msg.to}: ${msg.subject}\n${msg.text}\n`);
    } else {
      console.error("SMTP is not configured; email not sent");
    }
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? "Bill OCR <no-reply@localhost>",
      ...msg,
    });
  } catch (err) {
    console.error("Email failed:", err);
  }
}
