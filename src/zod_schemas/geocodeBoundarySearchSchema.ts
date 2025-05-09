import { z } from 'zod'
import { listingFilterParamsSchema } from './listingSearchParamsSchema'

export const geocodeBoundaryQuerySchema = z
  .object({
    address: z.string(),
    place_id: z.string()
  })
  .partial()
  .extend({
    address_types: z.string().optional()
  })
  .merge(listingFilterParamsSchema.partial())
  .strict()
  .refine(
    ({ address, place_id }) => address || place_id,
    {
      path: ['address/place_id'],
      message: 'Either "address" or "place_id" are required'
    }
  )

export const geocodeBoundaryRequestSchema = z.object({
  query: geocodeBoundaryQuerySchema
})

export type GeocodeBoundaryQueryParams = z.infer<typeof geocodeBoundaryQuerySchema>

export type GeocodeBoundaryRequest = z.infer<
  typeof geocodeBoundaryRequestSchema
>
