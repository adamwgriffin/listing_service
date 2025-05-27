import { getPaginationParams } from "../lib";
import { type FindWithinBoundsResult } from "../respositories/ListingRepository";
import type {
  ListingResult,
  ListingSearchResponse
} from "../types/listing_search_response_types";
import type { ListingFilterParams } from "../zod_schemas/listingSearchParamsSchema";

export default (
  results: FindWithinBoundsResult[] | null,
  query: Partial<ListingFilterParams>
): ListingSearchResponse<ListingResult> => {
  const result = results?.[0];
  const listings = result?.listings || [];
  const pagination = getPaginationParams(query);
  const numberAvailable = result?.metadata[0]?.numberAvailable || 0;
  return {
    listings,
    pagination: {
      page: pagination.page_index,
      pageSize: pagination.page_size,
      numberReturned: listings.length,
      numberAvailable: numberAvailable,
      numberOfPages: Math.ceil(numberAvailable / pagination.page_size)
    }
  };
};
