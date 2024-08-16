import type { Context } from 'koa'
import type { IGeocodeBoundarySearchParams } from '../types/listing_search_params_types'
import type {
  ErrorResponse,
  GeocodeBoundaryListingSearchResponse,
  ListingDetailResultWithSelectedFields,
  ListingRadiusResultWithSelectedFields
} from '../types/listing_search_response_types'
import Listing from '../models/ListingModel'
import Boundary from '../models/BoundaryModel'
import { DefaultListingDetailResultFields, DefaultMaxDistance } from '../config'
import {
  geocode,
  getBoundaryTypeFromGeocoderAddressTypes
} from '../lib/geocoder'
import {
  boundsParamsToGeoJSONPolygon,
  getBoundaryGeometryWithBounds
} from '../lib/listing_search_helpers'
import { getPaginationParams } from '../lib'
import listingSearchView from '../views/listingSearchView'
import listingSearchGeocodeView from '../views/listingSearchGeocodeView'
import listingSearchGeocodeNoBoundaryView from '../views/listingSearchGeocodeNoBoundaryView'
import errorView from '../views/errorView'

export interface IGeocodeBoundaryContext extends Context {
  query: IGeocodeBoundarySearchParams
  status: number
  body: GeocodeBoundaryListingSearchResponse | ErrorResponse
}

export const geocodeBoundarySearch = async (ctx: IGeocodeBoundaryContext) => {
  try {
    // make the request to the geocode service
    const geocoderResult = await geocode(ctx.query)
    const { lat, lng } = geocoderResult.data.results[0].geometry.location
    const boundaryType = getBoundaryTypeFromGeocoderAddressTypes(
      geocoderResult.data.results[0].types
    )

    const pagination = getPaginationParams(ctx.query)

    // if we can't find a boundary type in the response then we assume that the geocoderResult was an address.
    if (!boundaryType) {
      const listing =
        await Listing.findOne<ListingDetailResultWithSelectedFields>(
          { placeId: geocoderResult.data.results[0].place_id },
          DefaultListingDetailResultFields
        )
      return (ctx.body = listingSearchGeocodeNoBoundaryView(
        geocoderResult,
        pagination,
        listing
      ))
    }

    // search for a boundary that matches the geocoder response coordinates
    const boundaries = await Boundary.findBoundaries(lat, lng, boundaryType)

    if (boundaries.length === 0) {
      return (ctx.body = listingSearchGeocodeNoBoundaryView(
        geocoderResult,
        pagination
      ))
    }

    const results = await Listing.findWithinBounds(
      boundaries[0].geometry,
      ctx.query,
      pagination
    )

    ctx.body = listingSearchGeocodeView(
      boundaries,
      geocoderResult,
      results,
      pagination
    )
  } catch (error) {
    ctx.status = error?.response?.status || 500
    ctx.body = errorView(error)
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

    ctx.body = listingSearchView(results, pagination)
  } catch (error) {
    ctx.status = 500
    ctx.body = errorView(error)
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
    ctx.body = listingSearchView(results, pagination)
  } catch (error) {
    ctx.status = 500
    ctx.body = errorView(error)
  }
}

export const radiusSearch = async (ctx: Context) => {
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
