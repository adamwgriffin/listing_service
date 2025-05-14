import { z } from 'zod'
import { objectId } from '.'

export const listingDetailRequestSchema = z.object({
  params: objectId
})

export type ListingDetailRequest = z.infer<typeof listingDetailRequestSchema>
