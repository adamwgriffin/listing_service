import type { PaginationParams } from '../types/listing_search_params_types'
import type { GeocodeBoundarySearchResponse } from '../types/listing_search_response_types'
import type { ListingDetailResultWithSelectedFields } from '../types/listing_search_response_types'
import { AddressGeometry } from '@googlemaps/google-maps-services-js'

export default (
  viewport: AddressGeometry['viewport'],
  pagination: PaginationParams,
  listingDetail: ListingDetailResultWithSelectedFields | null | undefined = null
) => {
  const response: GeocodeBoundarySearchResponse = {
    viewport,
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
