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
  status: 'active' | 'sold'
  sort_by: SortType
  sort_direction: SortDirection
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
  listings: IListing[]
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
