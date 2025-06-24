import { z } from "zod";

export const listingDetailRequestSchema = z.object({
  params: z.object({
    slug: z.string()
  })
});

export type ListingDetailRequest = z.infer<typeof listingDetailRequestSchema>;
