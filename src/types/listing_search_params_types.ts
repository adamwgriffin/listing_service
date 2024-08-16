export type SortType = 'listedDate' | 'listPrice' | 'beds' | 'baths' | 'sqft'

export type SortDirection = 'asc' | 'desc'

export interface PaginationParams {
  page_index: number
  page_size: number
}

export interface IListingParams extends PaginationParams {
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
  rental: 'true' | 'false'
  sold_in_last: number // days
  // can be used together as a date/time range, e.g.,
  // open_house_after=2023-06-01T04:31:54.365Z - open_house_before=2023-08-28T04:54:39.513Z
  open_house_after: string
  open_house_before: string
}

export interface IBoundsParams {
  bounds_north: number
  bounds_east: number
  bounds_south: number
  bounds_west: number
}

export interface IGeocodeBoundarySearchParams extends Partial<IListingParams> {
  address?: string
  place_id?: string
}
