import type { Context } from 'koa'
import type { GeocodeBoundarySearchParams } from '../zod_schemas/geocodeBoundarySearchSchema'
import type { BoundarySearchParams } from '../zod_schemas/boundarySearchRequestSchema'
import type { BoundsSearchParams } from '../zod_schemas/boundsSearchRequestSchema'
import type { RadiusSearchParams } from '../zod_schemas/radiusSearchRequestSchema'
import type {
  GeocodeBoundarySearchResponse,
  ListingRadiusResultWithSelectedFields,
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

export type GeocodeBoundaryContext = {
  query: GeocodeBoundarySearchParams
  status: number
  body: GeocodeBoundarySearchResponse
} & Context

export type BoundarySearchContext = {
  params: {
    id: string
  }
  query: BoundarySearchParams
  status: number
  body: ListingSearchResponse
} & Context

export type BoundsSearchContext = {
  query: BoundsSearchParams
  status: number
  body: ListingSearchResponse
} & Context

export type RadiusSearchContext = {
  query: RadiusSearchParams
  status: number
  body: ListingSearchResponse<ListingRadiusResultWithSelectedFields>
} & Context

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

  ctx.body = listingSearchView(results, pagination)
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

export const radiusSearch = async (ctx: RadiusSearchContext) => {
  const { lat, lng, max_distance } = ctx.query
  const pagination = getPaginationParams(ctx.query)
  const results =
    await Listing.findWithinRadius<ListingRadiusResultWithSelectedFields>(
      lat,
      lng,
      max_distance,
      ctx.query,
      pagination
    )
  ctx.body = listingSearchView<ListingRadiusResultWithSelectedFields>(
    results,
    pagination
  )
}
