import type { IBoundary } from '../models/BoundaryModel'
import { type FindWithinBoundsResult } from '../respositories/ListingRepository'
import type { BoundarySearchResponse } from '../types/listing_search_response_types'
import type { PaginationParams } from '../zod_schemas/listingSearchParamsSchema'
import listingSearchView from './listingSearchView'

export default (
  boundary: IBoundary,
  results: FindWithinBoundsResult[],
  pagination: PaginationParams
): BoundarySearchResponse => {
  return {
    boundary,
    ...listingSearchView(results, pagination)
  }
}
