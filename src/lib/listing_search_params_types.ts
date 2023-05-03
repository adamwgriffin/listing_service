import type { Context } from 'koa'
import type { IListing } from '../models/listingModel'
import type { IBoundary } from '../models/BoundaryModel'
import { GeocodeResult } from '@googlemaps/google-maps-services-js'

export type ISortById =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18

export interface IListingParams {
  page_index: number
  page_size: number
  price_min: number
  price_max: number
  beds_min: number
  beds_max: number
  baths_min: number
  baths_max: number
  sqft_min: number
  sqft_max: number
  year_built_min: number
  year_built_max: number
  lot_size_min: number
  lot_size_max: number
  status: 'active' | 'sold'
  sort_by: ISortById
  waterfront: boolean
  view: boolean
  garage: boolean
  new_construction: boolean
  virtual_tour: boolean
  pool: boolean
  senior_community: boolean
  sold_days: number
}

export interface IBoundsParams {
  boundsNorth: number
  boundsEast: number
  boundsSouth: number
  boundsWest: number
}

export interface IGeocodeBoundarySearchParams extends Partial<IListingParams> {
  address?: string
  place_id?: string
}

export interface IGeocodeBoundarySuccessResponse{
  listings: IListing[]
  boundary: IBoundary
  geocoderResult: GeocodeResult[]
}

export interface IErrorResponse {
  error: string
}

export interface IGeocodeBoundaryContext extends Context {
  query: IGeocodeBoundarySearchParams
  status: number
  body: IGeocodeBoundarySuccessResponse | IErrorResponse
}
