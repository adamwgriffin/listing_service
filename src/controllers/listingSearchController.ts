import type { Context } from 'koa'
import type { IGeocodeBoundaryContext } from '../types/listing_search_params_types'
import Listing from '../models/ListingModel'
import Boundary from '../models/BoundaryModel'
import { DefaultListingResultFields, DefaultMaxDistance } from '../config'
import {
  geocode,
  getBoundaryTypeFromGeocoderAddressTypes
} from '../lib/geocoder'
import {
  boundsParamsToGeoJSONPolygon,
  getBoundaryGeometryWithBounds
} from '../lib/listing_search_helpers'
import { getPaginationParams } from '../lib'
import listingSearchResponse from '../views/listing_search_view'
import listingSearchGeocodeResponse from '../views/listing_search_geocode_view'
import errorResponse from '../views/error_view'

export const geocodeBoundarySearch = async (ctx: IGeocodeBoundaryContext) => {
  try {
    // make the request to the geocode service
    const geocoderResult = await geocode(ctx.query)
    const { lat, lng } = geocoderResult.data.results[0].geometry.location
    const boundaryType = getBoundaryTypeFromGeocoderAddressTypes(
      geocoderResult.data.results[0].types
    )

    // search for a boundary that matches the geocoder response coordinates
    const boundaries = await Boundary.findBoundaries(lat, lng, boundaryType)

    const pagination = getPaginationParams(ctx.query)

    if (boundaries.length === 0) {
      ctx.status = 404
      return (ctx.body = {
        error: 'No boundary found for query.'
      })
    }

    const results = await Listing.findWithinBounds(
      boundaries[0].geometry,
      ctx.query,
      pagination
    )

    ctx.body = listingSearchGeocodeResponse(
      boundaries,
      geocoderResult,
      results,
      pagination
    )
  } catch (error) {
    ctx.status = error?.response?.status || 500
    ctx.body = errorResponse(error)
  }
}

export const boundarySearch = async (ctx: Context) => {
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

    ctx.body = listingSearchResponse(results, pagination)
  } catch (error) {
    ctx.status = 500
    ctx.body = errorResponse(error)
  }
}

export const boundsSearch = async (ctx: Context) => {
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
    ctx.body = listingSearchResponse(results, pagination)
  } catch (error) {
    ctx.status = 500
    ctx.body = errorResponse(error)
  }
}

export const radiusSearch = async (ctx: Context) => {
  const { lat, lng, max_distance } = ctx.query
  const pagination = getPaginationParams(ctx.query)

  try {
    // "distance" is the fieldname set in the  "distanceField" for the $geoNear query in the findWithinRadius method
    const results = await Listing.findWithinRadius(
      Number(lat),
      Number(lng),
      Number(max_distance) || DefaultMaxDistance,
      ctx.query,
      pagination,
      { ...DefaultListingResultFields, distance: 1 }
    )
    ctx.body = listingSearchResponse(results, pagination)
  } catch (error) {
    ctx.status = 500
    ctx.body = errorResponse(error)
  }
}
