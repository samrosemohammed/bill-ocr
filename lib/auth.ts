import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { emailOTP, twoFactor } from "better-auth/plugins";
import { prisma8Adapter } from "better-auth-adapter-prisma8";
import { db } from "@/prisma/db";
import { codeEmail, sendEmail } from "@/lib/email";

export const auth = betterAuth({
  appName: "Bill OCR",
  database: prisma8Adapter(db, { provider: "postgresql", transaction: true }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    onExistingUserSignUp: async ({ user }) => {
      void sendEmail({
        to: user.email,
        subject: "Sign-up attempt with your email",
        text: "Someone tried to create a Bill OCR account with your email. If it was you, sign in instead (or reset your password). If not, ignore this email.",
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // Codes are for verification and password reset only, never for signing in
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-in/email-otp") {
        throw new APIError("FORBIDDEN", {
          message: "Please sign in with your password.",
        });
      }
    }),
  },

  plugins: [
    twoFactor(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      otpLength: 6,
      expiresIn: 300, // seconds
      storeOTP: "hashed",
      disableSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "email-verification" && type !== "forget-password") return;

        // Not awaited on purpose, so response time doesn't reveal whether the email exists
        void sendEmail({
          to: email,
          subject:
            type === "email-verification"
              ? "Your Bill OCR verification code"
              : "Your Bill OCR password reset code",
          ...codeEmail({
            intro:
              type === "email-verification"
                ? "Use this code to verify your email address."
                : "Use this code to reset your password.",
            code: otp,
          }),
        });
      },
    }),
    nextCookies(), // keep last
  ],
});
