import type { ListingSearchAggregateResult } from '../models/ListingModel'
import type { IBoundary } from '../models/BoundaryModel'
import type { PaginationParams } from '../types/listing_search_params_types'
import type { GeocodeBoundarySearchResponse } from '../types/listing_search_response_types'
import type { ListingResultWithSelectedFields } from '../types/listing_search_response_types'
import listingSearchView from './listingSearchView'

export default (
  boundaries: IBoundary[],
  results: ListingSearchAggregateResult<ListingResultWithSelectedFields>,
  pagination: PaginationParams
): GeocodeBoundarySearchResponse => {
  return {
    boundary: boundaries[0],
    ...listingSearchView(results, pagination)
  }
}
