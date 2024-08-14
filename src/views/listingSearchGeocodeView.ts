import type { Document } from 'mongoose'
import type { IListing } from '../models/ListingModel'
import type { IBoundary } from '../models/BoundaryModel'
import { IGeocodeBoundaryListingSearchResponse, PaginationParams } from '../types/listing_search_params_types'
import { GeocodeResponse } from '@googlemaps/google-maps-services-js'
import listingSearchResponse from './listingSearchView'

export default (
  boundaries: IBoundary[],
  geocoderResult: GeocodeResponse,
  results: Document<IListing>,
  pagination: PaginationParams
): IGeocodeBoundaryListingSearchResponse => {
  return {
    boundary: boundaries[0],
    geocoderResult: geocoderResult.data.results,
    ...listingSearchResponse(results, pagination)
  }
}
