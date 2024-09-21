import { z } from 'zod'
import {
  boundsParamsSchema,
  listingFilterParamsSchema
} from './listingSearchParamsSchema'

export const boundarySearchParamsSchema = boundsParamsSchema
  .partial()
  .merge(listingFilterParamsSchema.partial())
  .strict()
  .refine(
    ({ bounds_north, bounds_east, bounds_south, bounds_west }) => {
      const boundsParamCount = [
        bounds_north,
        bounds_east,
        bounds_south,
        bounds_west
      ].filter((p) => p).length
      return boundsParamCount === 0 || boundsParamCount === 4
    },
    {
      message: 'Either all bounds params or none must be included.',
      path: ['bounds_north', 'bounds_east', 'bounds_south', 'bounds_west']
    }
  )

export type BoundarySearchParams = z.infer<typeof boundarySearchParamsSchema>
