import dotenv from "dotenv";
import { envSchema } from "../zod_schemas/envSchema";

dotenv.config();

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(parsed.error.format(), null, 2)
  );
  process.exit(1);
}

const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = parsed.data;
export const MongoDbUrl = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;

export default parsed.data;
