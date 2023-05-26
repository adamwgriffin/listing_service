import type { Context } from 'koa'
import type { IListing } from '../models/listingModel'
import type { IBoundary } from '../models/BoundaryModel'
import { GeocodeResult } from '@googlemaps/google-maps-services-js'

export type SortType = 'listedDate' | 'listPrice' | 'beds' | 'baths' | 'sqft'

export type SortDirection = 'asc' | 'desc'

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
  sort_by: SortType
  sort_direction: SortDirection
  sold_days: number
  property_type: string
  status: string
  waterfront: 'true' | 'false' // koa doesn't parse booleans in the query string
  view: 'true' | 'false'
  fireplace: 'true' | 'false'
  basement: 'true' | 'false'
  garage: 'true' | 'false'
  new_construction: 'true' | 'false'
  pool: 'true' | 'false'
  air_conditioning: 'true' | 'false'
  sold_in_last: number // days
}

export interface IBoundsParams {
  bounds_north: number
  bounds_east: number
  bounds_south: number
  bounds_west: number
}

// TODO: not 100% on what really needs to be returned here
export interface IPaginationResponse {
  page: number
  pageSize: number
  numberReturned: number
  numberAvailable: number
  numberOfPages: number
}

export interface IGeocodeBoundarySearchParams extends Partial<IListingParams> {
  address?: string
  place_id?: string
}

export interface IGeocodeBoundarySuccessResponse{
  listings: Partial<IListing>[]
  boundary: IBoundary
  geocoderResult: GeocodeResult[],
  pagination: IPaginationResponse
}

export interface IErrorResponse {
  error: string
}

export interface IGeocodeBoundaryContext extends Context {
  query: IGeocodeBoundarySearchParams
  status: number
  body: IGeocodeBoundarySuccessResponse | IErrorResponse
}
