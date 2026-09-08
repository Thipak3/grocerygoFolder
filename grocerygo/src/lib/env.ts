import { z } from "zod";

const envSchema = z.object({
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  AUTH_GOOGLE_CLIENT_ID: z.string().min(1, "AUTH_GOOGLE_CLIENT_ID is required").or(z.string().min(1).optional().transform(() => process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID)),
  AUTH_GOOGLE_CLIENT_SECRET: z.string().min(1, "AUTH_GOOGLE_CLIENT_SECRET is required").or(z.string().min(1).optional().transform(() => process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET)),
  MONGODB_URL: z.string().min(1, "MONGODB_URL is required"),
  NEXTAUTH_URL: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  VERCEL_URL: z.string().optional(),
});

// Since process.env contains many variables, we need to allow unknown keys or pass process.env directly and let zod strip/pick.
const _env = envSchema.safeParse({
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_GOOGLE_CLIENT_ID: process.env.AUTH_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_CLIENT_SECRET: process.env.AUTH_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET,
  MONGODB_URL: process.env.MONGODB_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  VERCEL_URL: process.env.VERCEL_URL,
});

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
