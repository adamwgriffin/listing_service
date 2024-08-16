import type { ListingSearchAggregateResult } from '../models/ListingModel'
import type { IBoundary } from '../models/BoundaryModel'
import type { PaginationParams } from '../types/listing_search_params_types'
import type { GeocodeBoundarySearchResponse } from '../types/listing_search_response_types'
import type { ListingResultWithSelectedFields } from '../types/listing_search_response_types'
import { GeocodeResponse } from '@googlemaps/google-maps-services-js'
import listingSearchView from './listingSearchView'

export default (
  boundaries: IBoundary[],
  geocoderResult: GeocodeResponse,
  results: ListingSearchAggregateResult<ListingResultWithSelectedFields>,
  pagination: PaginationParams
): GeocodeBoundarySearchResponse => {
  return {
    boundary: boundaries[0],
    geocoderResult: geocoderResult.data.results,
    ...listingSearchView(results, pagination)
  }
}
