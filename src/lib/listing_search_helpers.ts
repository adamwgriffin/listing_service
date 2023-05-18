import type { Polygon, MultiPolygon } from '@turf/turf'
import type { FilterQuery } from 'mongoose'
import type { IListingDocument } from '../models/listingModel'
import type {
  IBoundsParams,
  IGeocodeBoundarySearchParams
} from './listing_search_params_types'
import { bboxPolygon, intersect } from '@turf/turf'

export const boundsParamsToGeoJSONPolygon = (
  bounds: IBoundsParams
): Polygon => {
  const { bounds_north, bounds_east, bounds_south, bounds_west } = bounds
  return bboxPolygon([bounds_west, bounds_south, bounds_east, bounds_north])
    .geometry
}

export const removePartsOfBoundaryOutsideOfBounds = (
  bounds: IBoundsParams,
  boundary: Polygon | MultiPolygon
): Polygon | MultiPolygon => {
  const boundsPolygon = boundsParamsToGeoJSONPolygon(bounds)
  return intersect(boundsPolygon, boundary).geometry
}

export const numberRangeQuery = (
  field: string,
  min: number | undefined,
  max: number | undefined
): FilterQuery<IListingDocument> => {
  const query: FilterQuery<IListingDocument> = { [field]: {} }
  if (min) {
    query[field].$gte = Number(min)
  }
  if (max) {
    query[field].$lte = Number(max)
  }
  return query
}

/*
example return value:
[
  {
    fieldName: {
      $gte: min,
      $lte: max
    }
  }
]
*/
export const buildfilterQueries = (
  params: IGeocodeBoundarySearchParams
): FilterQuery<IListingDocument>[] => {
  const {
    property_type,
    price_min,
    price_max,
    beds_min,
    beds_max,
    baths_min,
    baths_max,
    sqft_min,
    sqft_max,
    year_built_min,
    year_built_max,
    lot_size_min,
    lot_size_max
  } = params
  const filters = []
  if (property_type) {
    filters.push({
      propertyType: {
        $in: property_type.split(',')
      }
    })
  }
  // TODO: make this more DRY
  if (price_min || price_max) {
    filters.push(numberRangeQuery('listPrice', price_min, price_max))
  }
  if (beds_min || beds_max) {
    filters.push(numberRangeQuery('beds', beds_min, beds_max))
  }
  if (baths_min || baths_max) {
    filters.push(numberRangeQuery('baths', baths_min, baths_max))
  }
  if (sqft_min || sqft_max) {
    filters.push(numberRangeQuery('sqft', sqft_min, sqft_max))
  }
  if (year_built_min || year_built_max) {
    filters.push(numberRangeQuery('yearBuilt', year_built_min, year_built_max))
  }
  if (lot_size_min || lot_size_max) {
    filters.push(numberRangeQuery('lotSize', lot_size_min, lot_size_max))
  }
  return filters
}

export const buildfilterQueriesObject = (params: IGeocodeBoundarySearchParams): FilterQuery<IListingDocument> => {
  return buildfilterQueries(params).reduce((q, acc) => ({ ...acc, ...q }), {})
}