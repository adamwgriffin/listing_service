import { z } from "zod";

export const listingAddressSchema = z.object({
  line1: z.string().trim().min(1),
  line2: z.string().optional(),
  city: z.string().trim().min(1),
  state: z.string().trim().min(2),
  zip: z.string().trim().min(1)
});

export type ListingAddress = z.infer<typeof listingAddressSchema>;
