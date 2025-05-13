import { z } from 'zod'

export const objectId = z.object({
  id: z.string().regex(ValidObjectIdRegex, 'ID should be a valid ObjectId')
})

export const booleanEnum = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')
