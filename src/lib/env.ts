import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const schema = z.object({
  DB_HOST: z.string().min(1).default('localhost'),
  APP_PORT: z.coerce.number().int().positive().default(3001),
  DB_PORT: z.coerce.number().int().positive().default(27017),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),
  GOOGLE_MAPS_API_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(parsed.error.format(), null, 2)
  )
  process.exit(1)
}

export default parsed.data
