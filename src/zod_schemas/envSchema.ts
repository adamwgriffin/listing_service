import { z } from "zod";

const defaultCacheTTL = 7 * 24 * 60 * 60 * 1000; // 1 week

export const envSchema = z.object({
  DB_HOST: z.string().min(1).default("localhost"),
  APP_PORT: z.coerce.number().int().positive().default(3001),
  DB_PORT: z.coerce.number().int().positive().default(27017),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),
  REDIS_URL: z.string().min(1),
  CACHE_TTL: z.coerce.number().int().positive().default(defaultCacheTTL),
  GOOGLE_MAPS_API_KEY: z.string().min(1),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info")
});
