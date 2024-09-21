import { z } from 'zod'
import { listingFilterParamsSchema } from './listingSearchParamsSchema'
import { DefaultMaxDistance } from '../config'

export const radiusSearchParamsSchema = z
  .object({
    lat: z.coerce.number(),
    lng: z.coerce.number(),
    max_distance: z.coerce.number().optional().default(DefaultMaxDistance)
  })
  .merge(listingFilterParamsSchema.partial())
  .strict()

export type RadiusSearchParams = z.infer<typeof radiusSearchParamsSchema>
