import type { Polygon, MultiPolygon } from '@turf/turf'
import type { FilterQuery } from 'mongoose'
import type { IListing } from '../models/listingModel'
import type {
  IBoundsParams,
  IGeocodeBoundarySearchParams
} from './listing_search_params_types'
import { bboxPolygon, intersect } from '@turf/turf'

export const boundsParamsToGeoJSONPolygon = (
  bounds: IBoundsParams
): Polygon => {
  const { boundsNorth, boundsEast, boundsSouth, boundsWest } = bounds
  return bboxPolygon([boundsWest, boundsSouth, boundsEast, boundsNorth])
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
): FilterQuery<IListing> => {
  const query: FilterQuery<IListing> = { [field]: {} }
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
): FilterQuery<IListing>[] => {
  const {
    price_min,
    price_max,
    beds_min,
    beds_max,
    baths_min,
    baths_max,
    sqft_min,
    sqft_max
  } = params
  const filters = []
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
  return filters
}

export const buildfilterQueriesObject = (params: IGeocodeBoundarySearchParams): FilterQuery<IListing> => {
  return buildfilterQueries(params).reduce((q, acc) => ({ ...acc, ...q }), {})
}