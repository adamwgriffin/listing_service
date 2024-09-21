import { z } from 'zod'
import {
  sharedGeocodeRequestSchema,
  geocodeRequestRefinements
} from './geocodeRequestSchema'
import { listingFilterParamsSchema } from './listingSearchParamsSchema'

export const geocodeBoundarySearchSchema = sharedGeocodeRequestSchema
  .extend({
    address_types: z.string().optional()
  })
  .merge(listingFilterParamsSchema.partial())
  .strict()
  .refine(...geocodeRequestRefinements)

export type GeocodeBoundarySearchParams = z.infer<
  typeof geocodeBoundarySearchSchema
>
