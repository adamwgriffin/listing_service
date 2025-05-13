import { z } from 'zod'

export const objectId = z.object({
  id: z.string().regex(/^[0-9a-f]{24}$/, 'ID should be a MongoDB ObjectId')
})
