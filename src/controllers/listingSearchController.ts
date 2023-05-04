import type { Context } from 'koa'
import type { IGeocodeBoundaryContext } from '../lib/listing_search_params_types'
import Listing from '../models/listingModel'
import Boundary from '../models/BoundaryModel'
import { DefaultListingResultFields, DefaultMaxDistance } from '../config'
import { geocode } from '../lib/geocoder'
import {
  boundsParamsToGeoJSONPolygon,
  removePartsOfBoundaryOutsideOfBounds,
  buildfilterQueries,
  buildfilterQueriesObject
} from '../lib/listing_search_helpers'

export const geocodeBoundarySearch = async (ctx: IGeocodeBoundaryContext) => {
  // get and validate the params
  const { address, place_id } = ctx.query
  let geocodeParams
  if (address) {
    geocodeParams = { address }
  } else if (place_id) {
    geocodeParams = { place_id }
  } else {
    ctx.status = 400
    ctx.body = {
      error: 'Either address or placeId query parameter is required'
    }
    return
  }

  try {
    // make the request to the geocode service
    const geocoderResult = await geocode(geocodeParams)
    const { lat, lng } = geocoderResult.data.results[0].geometry.location

    // search for a boundary that matches the geocoder response coordinates
    const boundaries = await Boundary.find({
      geometry: {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          }
        }
      }
    })

    // search for listings that are inside of the boundary that was found
    const listings = await Listing.find({
      $and: [
        {
          geometry: {
            $geoWithin: {
              $geometry: boundaries[0].geometry
            }
          }
        },
        ...buildfilterQueries(ctx.query)
      ]
    }).select(DefaultListingResultFields)

    // send all the data that was found back in the response
    ctx.body = {
      listings,
      boundary: boundaries[0],
      geocoderResult: geocoderResult.data.results
    }
  } catch (error) {
    ctx.status = error?.response?.status || 500
    ctx.body = { error: error.message }
  }
}

export const boundarySearch = async (ctx: Context) => {
  const { id } = ctx.params
  try {
    const boundary = await Boundary.findById(id)

    let boundaryGeometry
    const { boundsNorth, boundsEast, boundsSouth, boundsWest } = ctx.query
    // if bounds params are present, we want to modify the boundary so that any parts that are outside of the bounds
    // will be removed. this way the search will only return results that are within both the boundary & the bounds
    if (boundsNorth && boundsEast && boundsSouth && boundsWest) {
      const bounds = { boundsNorth, boundsEast, boundsSouth, boundsWest }
      boundaryGeometry = removePartsOfBoundaryOutsideOfBounds(
        bounds,
        boundary.geometry
      )
    } else {
      boundaryGeometry = boundary.geometry
    }

    const listings = await Listing.find({
      $and: [
        {
          geometry: {
            $geoWithin: {
              $geometry: boundaryGeometry
            }
          }
        },
        ...buildfilterQueries(ctx.query)
      ]
    }).select(DefaultListingResultFields)
    ctx.body = listings
  } catch (error) {
    ctx.status = 500
    ctx.body = { message: error.message }
  }
}

export const boundsSearch = async (ctx: Context) => {
  const { boundsNorth, boundsEast, boundsSouth, boundsWest } = ctx.query
  const geoJSONPolygon = boundsParamsToGeoJSONPolygon({
    boundsNorth,
    boundsEast,
    boundsSouth,
    boundsWest
  })
  try {
    const listings = await Listing.find({
      $and: [
        {
          geometry: {
            $geoWithin: {
              $geometry: geoJSONPolygon
            }
          }
        },
        ...buildfilterQueries(ctx.query)
      ]
    }).select(DefaultListingResultFields)
    ctx.body = listings
  } catch (error) {
    ctx.status = 500
    ctx.body = { message: error.message }
  }
}

export const radiusSearch = async (ctx: Context) => {
  const { lat, lng, maxDistance } = ctx.query
  try {
    const listings = await Listing.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
          },
          maxDistance: Number(maxDistance) || DefaultMaxDistance,
          spherical: true,
          distanceField: 'distance'
        }
      },
      {
        $match: buildfilterQueriesObject(ctx.query)
      },
      {
        // "distance" is the fieldname set in the  "distanceField" for the $geoNear query above
        $project: { ...DefaultListingResultFields, distance: 1 }
      }
    ])
    ctx.body = listings
  } catch (error) {
    ctx.status = 500
    ctx.body = { message: error.message }
  }
}
