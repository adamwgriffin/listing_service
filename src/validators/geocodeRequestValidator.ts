import { z } from 'zod'

export const geocodeRequestValidator = z
  .object({
    address: z.string(),
    place_id: z.string()
  })
  .partial()
  .refine(({ address, place_id }) => address || place_id, {
    path: ['address', 'place_id'],
    message: "Either 'address' or 'place_id' are required"
  })
