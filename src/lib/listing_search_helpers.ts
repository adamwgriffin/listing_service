import type { Polygon, MultiPolygon } from '@turf/turf'
import type { FilterQuery } from 'mongoose'
import type { ListingAddress, IListingModel } from '../models/ListingModel'
import type { IBoundary } from '../models/BoundaryModel'
import type {
  BoundsParams,
  GeocodeBoundarySearchParams,
  ListingFilterParams
} from '../types/listing_search_params_types'
import { bboxPolygon, intersect } from '@turf/turf'
import { differenceInDays, subDays } from 'date-fns'
import {
  addressComponentsToListingAddress,
  getPlaceDetails,
  isListingAddressType
} from './geocoder'
import {
  AddressComponent,
  AddressType,
  GeocodeResult
} from '@googlemaps/google-maps-services-js'
import Listing, { RequiredListingAddressFields } from '../models/ListingModel'
import { ListingDetailResultWithSelectedFields } from '../types/listing_search_response_types'
import { ListingDetailResultProjectionFields } from '../config'
import Boundary from '../models/BoundaryModel'
import { getPaginationParams } from '.'
import listingSearchGeocodeView from '../views/listingSearchGeocodeView'
import listingSearchGeocodeNoBoundaryView from '../views/listingSearchGeocodeNoBoundaryView'

/**
 * Create a MongoDB $sort query
 *
 * 1 == ascending, e.g., 1-10
 *
 * -1 == descending, e.g., 10-1
 *
 * @example
 * listingSortQuery({ "sort_by": "listedDate", "sort_direction": "asc" })
 * // { "listedDate": 1 }
 */
export const listingSortQuery = (
  query: Partial<ListingFilterParams>
): FilterQuery<IListingModel> => {
  const sortBy = query.sort_by || 'listedDate'
  const sortDirection = query.sort_direction === 'asc' ? 1 : -1
  return { [sortBy]: sortDirection }
}

export const daysOnMarket = (
  listedDate: Date,
  soldDate: Date | undefined
): number => {
  return differenceInDays(soldDate || new Date(), listedDate)
}

/**
 * Converts a set of north/east/south/west coordinates into a rectangular polygon
 */
export const boundsParamsToGeoJSONPolygon = (bounds: BoundsParams): Polygon => {
  const { bounds_north, bounds_east, bounds_south, bounds_west } = bounds
  return bboxPolygon([bounds_west, bounds_south, bounds_east, bounds_north])
    .geometry
}

/**
 * Remove any parts of a boundary that are outside of a set of bounds. These bounds typically represent the viewport of
 * a map. The purpose of doing this is adjust a geospatial boundary in order to avoid returning listings that are
 * outside the map viewport.
 */
export const removePartsOfBoundaryOutsideOfBounds = (
  bounds: BoundsParams,
  boundary: Polygon | MultiPolygon
) => {
  const boundsPolygon = boundsParamsToGeoJSONPolygon(bounds)
  return intersect(boundsPolygon, boundary).geometry
}

/**
 * If bounds params are present, modify the boundary so that any parts that are outside of the bounds will be
 * removed. This way the search will only return results that are within both the boundary + the bounds.
 */
export const getBoundaryGeometryWithBounds = (
  boundary: IBoundary,
  query: BoundsParams
): Polygon | MultiPolygon => {
  const { bounds_north, bounds_east, bounds_south, bounds_west } = query
  if (bounds_north && bounds_east && bounds_south && bounds_west) {
    const bounds = { bounds_north, bounds_east, bounds_south, bounds_west }
    return removePartsOfBoundaryOutsideOfBounds(bounds, boundary.geometry)
  } else {
    return boundary.geometry
  }
}

/**
 * Generates a MongoDB query object that searches within a min/max range for the given field.
 *
 * @example
 * numberRangeQuery('listPrice', 100000, 200000)
 * // Returns { "listPrice": { $gte: 100000, $lte: 200000 } }
 */
export const numberRangeQuery = (
  field: string,
  min: number | undefined,
  max: number | undefined
): FilterQuery<IListingModel> => {
  const query: FilterQuery<IListingModel> = { [field]: {} }
  if (min) {
    query[field].$gte = Number(min)
  }
  if (max) {
    query[field].$lte = Number(max)
  }
  return query
}

export const openHouseQuery = (
  open_house_after: string | undefined,
  open_house_before: string | undefined
): FilterQuery<IListingModel> => {
  const query: { $gte?: Date; $lte?: Date } = {}
  if (open_house_after) {
    query.$gte = new Date(open_house_after)
  }
  if (open_house_before) {
    query.$lte = new Date(open_house_before)
  }
  return {
    openHouses: {
      $elemMatch: { start: query }
    }
  }
}

/**
 * Convert listing search filter params into an array of MongoDB queries for each filter.
 *
 * @example
 * buildfilterQueries({ "price_min": 100000, "waterfornt": "true" })
 * // Returns [{ "listPrice": { $gte: 100000} }, { "waterfornt": true }]
 */
export const buildfilterQueries = (
  params: GeocodeBoundarySearchParams
): FilterQuery<IListingModel>[] => {
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
    sold_in_last,
    open_house_after,
    open_house_before
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
  if (open_house_after || open_house_before) {
    filters.push(openHouseQuery(open_house_after, open_house_before))
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
  } else {
    filters.push({ rental: { $exists: false } })
  }
  return filters
}

/**
 * Convert listing search filter params into an object with MongoDB queries for each filter. Same as buildfilterQueries
 * only the query is one object rather than an array of objects.
 *
 * @example
 * buildfilterQueriesObject({ "price_min": 100000, "waterfornt": "true" })
 * // Returns { "listPrice": { $gte: 100000} }, "waterfornt": true }
 */
export const buildfilterQueriesObject = (
  params: GeocodeBoundarySearchParams
): FilterQuery<IListingModel> => {
  return buildfilterQueries(params).reduce((q, acc) => ({ ...acc, ...q }), {})
}

export const listingAddressHasRequiredFields = (
  listingAddress: Partial<ListingAddress>
) =>
  RequiredListingAddressFields.every(
    (field) => listingAddress[field]?.length > 0
  )

export const getListingForAddressSearch = async (
  address_components: AddressComponent[],
  place_id: string
) => {
  const listingAddress = addressComponentsToListingAddress(address_components)
  if (listingAddressHasRequiredFields(listingAddress)) {
    return Listing.findByPlaceIdOrAddress(place_id, listingAddress)
  } else {
    return Listing.findOne<ListingDetailResultWithSelectedFields>(
      { placeId: place_id },
      ListingDetailResultProjectionFields
    )
  }
}

export const getAddressTypesFromParams = (address_types: string) =>
  address_types.split(',') as AddressType[]

export const getResponseForPlaceId = async (
  query: GeocodeBoundarySearchParams
) => {
  const { place_id, address_types } = query
  if (!place_id || !address_types) return
  // If it's an address we will need to geocode so we can't just use place_id. Logic in the controller handles that for
  // the sake of effeciency
  if (isListingAddressType(getAddressTypesFromParams(address_types))) return

  const pagination = getPaginationParams(query)
  const boundary = await Boundary.findOne({ placeId: place_id })
  if (!boundary) {
    const { geometry } = (await getPlaceDetails({ place_id })).data.result
    return listingSearchGeocodeNoBoundaryView(geometry.viewport, pagination)
  }
  const results = await Listing.findWithinBounds(
    boundary.geometry,
    query,
    pagination
  )
  return listingSearchGeocodeView(boundary, results, pagination)
}

export const getResponseForListingAddress = async (
  { address_components, place_id, geometry }: GeocodeResult,
  query: GeocodeBoundarySearchParams
) => {
  const listing = await getListingForAddressSearch(address_components, place_id)
  const pagination = getPaginationParams(query)
  return listingSearchGeocodeNoBoundaryView(
    geometry.viewport,
    pagination,
    listing
  )
}

export const getResponseForBoundary = async (
  { place_id, geometry }: GeocodeResult,
  query: GeocodeBoundarySearchParams
) => {
  const pagination = getPaginationParams(query)
  const boundary = await Boundary.findOne({ placeId: place_id })
  if (!boundary) {
    return listingSearchGeocodeNoBoundaryView(geometry.viewport, pagination)
  }
  const results = await Listing.findWithinBounds(
    boundary.geometry,
    query,
    pagination
  )
  return listingSearchGeocodeView(boundary, results, pagination)
}
