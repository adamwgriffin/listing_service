import { getPaginationParams } from '../lib';
import { type FindWithinBoundsResult } from "../respositories/ListingRepository";
import type {
  ListingResult,
  ListingSearchResponse
} from "../types/listing_search_response_types";
import type { ListingFilterParams } from "../zod_schemas/listingSearchParamsSchema";

export default (
  results: FindWithinBoundsResult[],
  query: Partial<ListingFilterParams>
): ListingSearchResponse<ListingResult> => {
  const { listings, metadata } = results[0];
  const pagination = getPaginationParams(query);
  const numberAvailable = metadata[0]?.numberAvailable || 0;
  return {
    listings: listings,
    pagination: {
      page: pagination.page_index,
      pageSize: pagination.page_size,
      numberReturned: listings.length,
      numberAvailable: numberAvailable,
      numberOfPages: Math.ceil(numberAvailable / pagination.page_size)
    }
  };
};
