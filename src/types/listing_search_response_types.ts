import type { Types } from 'mongoose'
import type { IListing } from '../models/ListingModel'
import type { IBoundary } from '../models/BoundaryModel'
import {
  DefaultListingResultFields,
  DefaultListingDetailResultFields
} from '../config'
import { GeocodeResult } from '@googlemaps/google-maps-services-js'

export type AdditionalListingResultFields = {
  _id: Types.ObjectId
  latitude: number
  longitude: number
}

export type ListingResultWithSelectedFields = Pick<
  IListing,
  Exclude<keyof typeof DefaultListingResultFields, 'latitude' | 'longitude'>
> &
  AdditionalListingResultFields

export type ListingRadiusResultWithSelectedFields =
  ListingResultWithSelectedFields & { distance: number }

export type ListingDetailResultWithSelectedFields = Pick<
  IListing,
  Exclude<
    keyof typeof DefaultListingDetailResultFields,
    'latitude' | 'longitude'
  >
> &
  AdditionalListingResultFields

export type PaginationResponse = {
  page: number
  pageSize: number
  numberReturned: number
  numberAvailable: number
  numberOfPages: number
}

export type ListingSearchResponse<T = ListingResultWithSelectedFields> = {
  listings: T[]
  pagination: PaginationResponse
}

export type GeocodeBoundarySearchResponse = ListingSearchResponse & {
  boundary: IBoundary | null
  geocoderResult: GeocodeResult[]
  listingDetail?: ListingDetailResultWithSelectedFields
}

export type ErrorResponse = {
  error: string
}