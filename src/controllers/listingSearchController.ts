import type { Context } from 'koa'
import type {
  BoundarySearchParams,
  GeocodeBoundarySearchParams,
  RadiusSearchParams
} from '../types/listing_search_params_types'
import type {
  ErrorResponse,
  GeocodeBoundarySearchResponse,
  ListingRadiusResultWithSelectedFields,
  ListingSearchResponse
} from '../types/listing_search_response_types'
import Listing from '../models/ListingModel'
import Boundary from '../models/BoundaryModel'
import { DefaultMaxDistance } from '../config'
import {
  geocode,
  getBoundaryTypeFromGeocoderAddressTypes,
  isListingAddressType
} from '../lib/geocoder'
import {
  boundsParamsToGeoJSONPolygon,
  getBoundaryGeometryWithBounds,
  getListingForAddressSearch
} from '../lib/listing_search_helpers'
import { getPaginationParams } from '../lib'
import listingSearchView from '../views/listingSearchView'
import listingSearchGeocodeView from '../views/listingSearchGeocodeView'
import listingSearchGeocodeNoBoundaryView from '../views/listingSearchGeocodeNoBoundaryView'
import errorView from '../views/errorView'

export interface GeocodeBoundaryContext extends Context {
  query: GeocodeBoundarySearchParams
  status: number
  body: GeocodeBoundarySearchResponse | ErrorResponse
}

export interface BoundarySearchContext extends Context {
  params: {
    id: string
  }
  query: BoundarySearchParams
  status: number
  body: ListingSearchResponse | ErrorResponse
}

export interface BoundsSearchContext extends Context {
  query: BoundarySearchParams
  status: number
  body: ListingSearchResponse | ErrorResponse
}

export interface RadiusSearchContext extends Context {
  query: RadiusSearchParams
  status: number
  body:
    | ListingSearchResponse<ListingRadiusResultWithSelectedFields>
    | ErrorResponse
}

export const geocodeBoundarySearch = async (ctx: GeocodeBoundaryContext) => {
  try {
    // Make the request to the geocode service
    const geocodeResponse = await geocode(ctx.query)
    const geocodeResult = geocodeResponse.data.results[0]

    const pagination = getPaginationParams(ctx.query)

    if (isListingAddressType(geocodeResult.types[0])) {
      const listing = await getListingForAddressSearch(geocodeResult)
      ctx.body = listingSearchGeocodeNoBoundaryView(
        geocodeResult,
        pagination,
        listing
      )
      return
    }

    const boundaryType = getBoundaryTypeFromGeocoderAddressTypes(
      geocodeResult.types
    )

    // The geocode result type is not a type that we support for boundaries
    if (!boundaryType) {
      ctx.body = listingSearchGeocodeNoBoundaryView(geocodeResult, pagination)
      return
    }

    // Search for a boundary that matches the geocode response coordinates
    const { lat, lng } = geocodeResult.geometry.location
    const boundaries = await Boundary.findBoundaries(lat, lng, boundaryType)

    if (boundaries.length === 0) {
      ctx.body = listingSearchGeocodeNoBoundaryView(geocodeResult, pagination)
      return
    }

    const results = await Listing.findWithinBounds(
      boundaries[0].geometry,
      ctx.query,
      pagination
    )

    ctx.body = listingSearchGeocodeView(
      boundaries,
      results,
      pagination
    )
  } catch (error) {
    ctx.status = error?.response?.status || 500
    ctx.body = errorView(error)
  }
}

export const boundarySearch = async (ctx: BoundarySearchContext) => {
  const { id } = ctx.params
  try {
    const boundary = await Boundary.findById(id)

    if (!boundary) {
      ctx.status = 404
      return (ctx.body = {
        error: `No boundary found for boundary id ${id}.`
      })
    }

    const pagination = getPaginationParams(ctx.query)

    const results = await Listing.findWithinBounds(
      getBoundaryGeometryWithBounds(boundary, ctx.query),
      ctx.query,
      pagination
    )

    ctx.body = listingSearchView(results, pagination)
  } catch (error) {
    ctx.status = 500
    ctx.body = errorView(error)
  }
}

export const boundsSearch = async (ctx: BoundsSearchContext) => {
  const { bounds_north, bounds_east, bounds_south, bounds_west } = ctx.query
  const geoJSONPolygon = boundsParamsToGeoJSONPolygon({
    bounds_north,
    bounds_east,
    bounds_south,
    bounds_west
  })
  try {
    const pagination = getPaginationParams(ctx.query)
    const results = await Listing.findWithinBounds(
      geoJSONPolygon,
      ctx.query,
      pagination
    )
    ctx.body = listingSearchView(results, pagination)
  } catch (error) {
    ctx.status = 500
    ctx.body = errorView(error)
  }
}

export const radiusSearch = async (ctx: RadiusSearchContext) => {
  const { lat, lng, max_distance } = ctx.query
  const pagination = getPaginationParams(ctx.query)

  try {
    const results =
      await Listing.findWithinRadius<ListingRadiusResultWithSelectedFields>(
        Number(lat),
        Number(lng),
        Number(max_distance) || DefaultMaxDistance,
        ctx.query,
        pagination
      )
    ctx.body = listingSearchView<ListingRadiusResultWithSelectedFields>(
      results,
      pagination
    )
  } catch (error) {
    ctx.status = 500
    ctx.body = errorView(error)
  }
}
