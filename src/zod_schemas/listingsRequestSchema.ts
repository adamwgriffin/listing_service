import { z } from 'zod'
import { ValidObjectIdRegex } from '.'

export const listingsParams = z.object({
  ids: z
    .string()
    .trim()
    .transform((ids) => ids.split(','))
    .refine((ids) => ids.every((id) => ValidObjectIdRegex.test(id)), {
      message: 'Every ID should be a valid ObjectId'
    })
})

export const listingsRequestSchema = z.object({
  params: listingsParams
})

export type ListingsRequest = z.infer<typeof listingsRequestSchema>
