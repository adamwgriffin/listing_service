import { z } from 'zod'
import {
  boundsParamsSchema,
  listingFilterParamsSchema
} from './listingSearchParamsSchema'

export const boundsSearchParamsSchema = boundsParamsSchema
  .merge(listingFilterParamsSchema.partial())
  .strict()

export type BoundsSearchParams = z.infer<typeof boundsSearchParamsSchema>
