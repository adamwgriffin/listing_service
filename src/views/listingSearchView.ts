import { type FindWithinBoundsResult } from '../respositories/listingRepository'
import type {
  ListingResultWithSelectedFields,
  ListingSearchResponse
} from '../types/listing_search_response_types'
import type { PaginationParams } from '../zod_schemas/listingSearchParamsSchema'

export default (
  results: FindWithinBoundsResult[],
  pagination: PaginationParams
): ListingSearchResponse<ListingResultWithSelectedFields> => {
  const { listings, metadata } = results[0]
  const numberAvailable = metadata[0]?.numberAvailable || 0
  return {
    listings: listings,
    pagination: {
      page: pagination.page_index,
      pageSize: pagination.page_size,
      numberReturned: listings.length,
      numberAvailable: numberAvailable,
      numberOfPages: Math.ceil(numberAvailable / pagination.page_size)
    }
  }
}
