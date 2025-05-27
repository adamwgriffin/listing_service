import type { IBoundary } from "../models/BoundaryModel";
import { type FindWithinBoundsResult } from "../respositories/ListingRepository";
import type { BoundarySearchResponse } from "../types/listing_search_response_types";
import type { ListingFilterParams } from "../zod_schemas/listingSearchParamsSchema";
import listingSearchView from "./listingSearchView";

export default (
  boundary: IBoundary,
  results: FindWithinBoundsResult[] | null,
  query: Partial<ListingFilterParams>
): BoundarySearchResponse => {
  return {
    boundary,
    ...listingSearchView(results, query)
  };
};
