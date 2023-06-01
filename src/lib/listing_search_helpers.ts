import type { Polygon, MultiPolygon } from '@turf/turf'
import type { FilterQuery } from 'mongoose'
import type { IListingDocument } from '../models/listingModel'
import type {
  IBoundsParams,
  IGeocodeBoundarySearchParams
} from './listing_search_params_types'
import { bboxPolygon, intersect } from '@turf/turf'
import { differenceInDays, subDays } from 'date-fns'

export const daysOnMarket = (listedDate: Date, soldDate: Date | undefined): number => {
  return differenceInDays(soldDate || new Date(), listedDate)
}

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

/*
example return value:
{
  fieldName: {
    $gte: min,
    $lte: max
  }
}
*/
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

export const buildfilterQueries = (
  params: IGeocodeBoundarySearchParams
): FilterQuery<IListingDocument>[] => {
  // TODO: refactor this. the list is way too long.
  const {
    property_type,
    status,
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
    lot_size_max,
    waterfront,
    view,
    fireplace,
    basement,
    garage,
    new_construction,
    pool,
    air_conditioning,
    rental,
    sold_in_last
  } = params
  const filters = []
  if (property_type) {
    filters.push({
      propertyType: {
        $in: property_type.split(',')
      }
    })
  }
  if (status) {
    filters.push({
      status: {
        $in: status.split(',')
      }
    })
  } else {
    filters.push({ status: 'active' })
  }
  if (sold_in_last) {
    filters.push({
      soldDate: {
        $gte: subDays(new Date(), sold_in_last)
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
  if (waterfront) {
    filters.push({ waterfront: waterfront === 'true' })
  }
  if (view) {
    filters.push({ view: view === 'true' })
  }
  if (fireplace) {
    filters.push({ fireplace: fireplace === 'true' })
  }
  if (basement) {
    filters.push({ basement: basement === 'true' })
  }
  if (garage) {
    filters.push({ garage: garage === 'true' })
  }
  if (new_construction) {
    filters.push({ newConstruction: new_construction === 'true' })
  }
  if (pool) {
    filters.push({ pool: pool === 'true' })
  }
  if (air_conditioning) {
    filters.push({ airConditioning: air_conditioning === 'true' })
  }
  if (rental) {
    filters.push({ rental: rental === 'true' })
  }
  return filters
}

export const buildfilterQueriesObject = (
  params: IGeocodeBoundarySearchParams
): FilterQuery<IListingDocument> => {
  return buildfilterQueries(params).reduce((q, acc) => ({ ...acc, ...q }), {})
}
