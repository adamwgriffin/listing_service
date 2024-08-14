import type { Document } from 'mongoose'
import type { IListing } from '../models/ListingModel'
import type {
  PaginationParams,
  IListingSearchResponse
} from '../types/listing_search_params_types'

export default (
  results: Document<IListing>,
  pagination: PaginationParams
): IListingSearchResponse => {
  const { data: listings, metadata } = results[0]
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
