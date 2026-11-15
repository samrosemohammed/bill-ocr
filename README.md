# Bill OCR

Turn photos of Nepali and English paper bills into structured data you can review and export.

**Live demo:** https://bill.mohammedsamrose.com.np

## Features

- Upload a bill photo by drag and drop or camera
- Gemini extracts the vendor, PAN, date, items and totals
- Nepali numerals and Bikram Sambat dates are converted in code, with warnings when the numbers don't add up
- Review the result next to the original image, then confirm
- Export confirmed bills to CSV
- Email/password, GitHub and Google login, email code verification, optional 2FA

## Tech stack

Next.js, TypeScript, Tailwind CSS, shadcn/ui, PostgreSQL, Prisma ORM 8, Better Auth, Gemini API, UploadThing

## Getting started

Create a `.env` file:

```bash
DATABASE_URL=
GEMINI_API_KEY=
GEMINI_MODELS=            # comma-separated, tried in order
BETTER_AUTH_SECRET=       # openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000
UPLOADTHING_TOKEN=

# Optional
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```

Then install and run:

```bash
git clone <repo-url>
cd bill-ocr
npm install
npx prisma contract emit
npx prisma db update
npm run dev
```

Open http://localhost:3000. With no SMTP settings in development, verification codes are printed in the terminal.
