import { z } from "zod";
import {
  boundsParamsSchema,
  listingFilterParamsSchema
} from "./listingSearchParamsSchema";
import { objectId } from ".";

export const boundarySearchQuerySchema = boundsParamsSchema
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
      ].filter((p) => p).length;
      return boundsParamCount === 0 || boundsParamCount === 4;
    },
    {
      message: "Either all bounds params or none must be included.",
      path: ["bounds_north", "bounds_east", "bounds_south", "bounds_west"]
    }
  );

export const boundarySearchRequestSchema = z.object({
  query: boundarySearchQuerySchema,
  params: objectId
});

export type BoundarySearchQueryParams = z.infer<
  typeof boundarySearchQuerySchema
>;

export type BoundarySearchRequest = z.infer<typeof boundarySearchRequestSchema>;
