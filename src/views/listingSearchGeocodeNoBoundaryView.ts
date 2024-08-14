import type { IListing } from '../models/ListingModel'
import { IGeocodeBoundaryListingSearchResponse, PaginationParams } from '../types/listing_search_params_types'
import { GeocodeResponse } from '@googlemaps/google-maps-services-js'

export default (
  geocoderResult: GeocodeResponse,
  pagination: PaginationParams,
  listingDetail: Partial<IListing> | null | undefined = null
) => {
  const response: IGeocodeBoundaryListingSearchResponse = {
    boundary: null,
    geocoderResult: geocoderResult.data.results,
    listings: [],
    pagination: {
      page: pagination.page_index,
      pageSize: pagination.page_size,
      numberReturned: 0,
      numberAvailable: 0,
      numberOfPages: 0
    }
  }
  if (listingDetail) {
    response.listingDetail = listingDetail
  }
  return response
}
