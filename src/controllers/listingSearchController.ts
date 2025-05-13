import { getPaginationParams } from '../lib'
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
} from '../services/listingSearchService'
import { ControllerContext } from '../types'
import type {
  BoundarySearchResponse,
  GeocodeBoundarySearchResponse,
  ListingSearchResponse
} from '../types/listing_search_response_types'
import listingSearchBoundaryView from '../views/listingSearchBoundaryView'
import listingSearchView from '../views/listingSearchView'
import type { BoundarySearchRequest } from '../zod_schemas/boundarySearchRequestSchema'
import type { BoundsSearchRequest } from '../zod_schemas/boundsSearchRequestSchema'
import type { GeocodeBoundaryRequest } from '../zod_schemas/geocodeBoundarySearchSchema'

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
  const placeIdRes = await getResponseForPlaceId(ctx)
  if (placeIdRes) {
    ctx.body = placeIdRes
    return
  }

  const geocodeResult = (await geocode(getGeocodeParamsFromQuery(ctx.query)))
    .data.results[0]

  if (isListingAddressType(geocodeResult.types)) {
    ctx.body = await getResponseForListingAddress(geocodeResult, ctx)
    return
  }

  ctx.body = await getResponseForBoundary(geocodeResult, ctx)
}

export const boundarySearch = async (ctx: BoundarySearchContext) => {
  const { id } = ctx.params
  const boundary = await ctx.repositories.boundary.findById(id)

  ctx.assert(boundary, 404, `No boundary found for boundary id ${id}.`)

  const pagination = getPaginationParams(ctx.query)

  const results = await ctx.repositories.listing.findWithinBounds(
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
  const results = await ctx.repositories.listing.findWithinBounds(
    geoJSONPolygon,
    ctx.query,
    pagination
  )
  ctx.body = listingSearchView(results, pagination)
}
