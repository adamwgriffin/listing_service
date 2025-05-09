import type { GeocodeBoundaryRequest } from '../zod_schemas/geocodeBoundarySearchSchema'
import type { BoundarySearchRequest } from '../zod_schemas/boundarySearchRequestSchema'
import type { BoundsSearchRequest } from '../zod_schemas/boundsSearchRequestSchema'
import type {
  GeocodeBoundarySearchResponse,
  BoundarySearchResponse,
  ListingSearchResponse
} from '../types/listing_search_response_types'
import Listing from '../models/ListingModel'
import Boundary from '../models/BoundaryModel'
import {
  geocode,
  getGeocodeParamsFromQuery,
  isListingAddressType
} from '../lib/geocoder'
import {
  boundsParamsToGeoJSONPolygon,
  getBoundaryGeometryWithBounds,
  getResponseForBoundary,
  getResponseForListingAddress,
  getResponseForPlaceId
} from '../lib/listing_search_helpers'
import { getPaginationParams } from '../lib'
import listingSearchView from '../views/listingSearchView'
import { ControllerContext } from '../types'
import listingSearchBoundaryView from '../views/listingSearchBoundaryView'

export type GeocodeBoundaryContext = ControllerContext<
  GeocodeBoundaryRequest,
  GeocodeBoundarySearchResponse
>

export type BoundarySearchContext = ControllerContext<
  BoundarySearchRequest,
  BoundarySearchResponse
>

export type BoundsSearchContext = ControllerContext<
  BoundsSearchRequest,
  ListingSearchResponse
>

export const geocodeBoundarySearch = async (ctx: GeocodeBoundaryContext) => {
  // If we have a place_id then we may not need to make an additional request to the geocode service
  const placeIdRes = await getResponseForPlaceId(ctx.query)
  if (placeIdRes) {
    ctx.body = placeIdRes
    return
  }

  const geocodeResult = (await geocode(getGeocodeParamsFromQuery(ctx.query)))
    .data.results[0]

  if (isListingAddressType(geocodeResult.types)) {
    ctx.body = await getResponseForListingAddress(geocodeResult)
    return
  }

  ctx.body = await getResponseForBoundary(geocodeResult, ctx.query)
}

export const boundarySearch = async (ctx: BoundarySearchContext) => {
  const { id } = ctx.params
  const boundary = await Boundary.findById(id)

  ctx.assert(boundary, 404, `No boundary found for boundary id ${id}.`)

  const pagination = getPaginationParams(ctx.query)

  const results = await Listing.findWithinBounds(
    getBoundaryGeometryWithBounds(boundary, ctx.query),
    ctx.query,
    pagination
  )

  ctx.body = listingSearchBoundaryView(boundary, results, pagination)
}

export const boundsSearch = async (ctx: BoundsSearchContext) => {
  const { bounds_north, bounds_east, bounds_south, bounds_west } = ctx.query
  const geoJSONPolygon = boundsParamsToGeoJSONPolygon({
    bounds_north,
    bounds_east,
    bounds_south,
    bounds_west
  })
  const pagination = getPaginationParams(ctx.query)
  const results = await Listing.findWithinBounds(
    geoJSONPolygon,
    ctx.query,
    pagination
  )
  ctx.body = listingSearchView(results, pagination)
}
