import type { Context } from 'koa'
import type { IGeocodeBoundaryContext } from '../lib/listing_search_params_types'
import { Client } from '@googlemaps/google-maps-services-js'
import Listing from '../models/listingModel'
import Boundary from '../models/BoundaryModel'
import {
  boundsParamsToGeoJSONPolygon,
  removePartsOfBoundaryOutsideOfBounds
} from '../lib/util'

const DefaultListingResultFields = {
  listPrice: 1,
  beds: 1,
  baths: 1,
  sqft: 1,
  neighborhood: 1,
  description: 1,
  address: 1,
  latitude: { $arrayElemAt: ['$geometry.coordinates', 1] },
  longitude: { $arrayElemAt: ['$geometry.coordinates', 0] }
}

const DefaultMaxDistance = 1609.34 // 1 mile in meters

const GeocodeTimeout = 1000 // milliseconds

const googleMapsClient = new Client({})

export const geocodeBoundarySearch = async (ctx: IGeocodeBoundaryContext) => {
  // get and validate the params
  const {
    address,
    place_id,
    price_min,
    price_max,
    beds_min,
    beds_max,
    baths_min,
    baths_max,
    sqft_min,
    sqft_max
  } = ctx.query
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
    const geocoderResult = await googleMapsClient.geocode({
      params: { ...geocodeParams, key: process.env.GOOGLE_MAPS_API_KEY },
      timeout: GeocodeTimeout
    })
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
        {
          listPrice: {
            $gte: Number(price_min) || 0,
            $lte: Number(price_max) || Number.MAX_SAFE_INTEGER
          }
        },
        {
          beds: {
            $gte: Number(beds_min) || 0,
            $lte: Number(beds_max) || Number.MAX_SAFE_INTEGER
          }
        },
        {
          baths: {
            $gte: Number(baths_min) || 0,
            $lte: Number(baths_max) || Number.MAX_SAFE_INTEGER
          }
        },
        {
          sqft: {
            $gte: Number(sqft_min) || 0,
            $lte: Number(sqft_max) || Number.MAX_SAFE_INTEGER
          }
        },
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
  const { listPriceMin, listPriceMax } = ctx.query
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
        {
          listPrice: {
            $gte: Number(listPriceMin) || 0,
            $lte: Number(listPriceMax) || Number.MAX_SAFE_INTEGER
          }
        }
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
      geometry: {
        $geoWithin: {
          $geometry: geoJSONPolygon
        }
      }
    }).select(DefaultListingResultFields)
    ctx.body = listings
  } catch (error) {
    ctx.status = 500
    ctx.body = { message: error.message }
  }
}

export const radiusSearch = async (ctx: Context) => {
  const { lat, lng, maxDistance, listPriceMin, listPriceMax } = ctx.query
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
        $match: {
          listPrice: {
            $gte: Number(listPriceMin) || 0,
            $lte: Number(listPriceMax) || Number.MAX_SAFE_INTEGER
          }
        }
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
