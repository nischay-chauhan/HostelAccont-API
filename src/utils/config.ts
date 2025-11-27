import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.string().optional(),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
}).passthrough();

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
}

const env = parsed.data;

export const config = {
    env: env.NODE_ENV,
    port: env.PORT ? Number(env.PORT) : 8000,
    databaseUrl: env.DATABASE_URL,
    jwtSecret: env.JWT_SECRET,
};
