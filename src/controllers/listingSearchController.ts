import type { Context } from 'koa'
import Listing from '../models/listingModel'
import Boundary from '../models/BoundaryModel'
import { Client } from '@googlemaps/google-maps-services-js'

const client = new Client({})
const apiKey = process.env.GOOGLE_MAPS_API_KEY

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
          maxDistance: Number(maxDistance) || 1609.34, // default 1 mile in meters
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
        $project: {
          address: 1,
          listPrice: 1,
          distance: 1,
          latitude: { $arrayElemAt: ['$geometry.coordinates', 1] },
          longitude: { $arrayElemAt: ['$geometry.coordinates', 0] }
        }
      }
    ])
    ctx.body = listings
  } catch (error) {
    ctx.status = 500
    ctx.body = { message: error.message }
  }
}

export const boundarySearch = async (ctx: Context) => {
  const { id } = ctx.params
  try {
    const boundary = await Boundary.findById(id)
    const listings = await Listing.find({
      geometry: {
        $geoWithin: {
          $geometry: boundary.geometry
        }
      }
    })
    ctx.body = listings
  } catch (error) {
    ctx.status = 500
    ctx.body = { message: error.message }
  }
}

export const geocodeBoundarySearch = async (ctx: Context) => {
  
  // get and validate the params
  const { address, placeId } = ctx.query
  let geocodeParams
  if (address) {
    geocodeParams = { address }
  } else if (placeId) {
    geocodeParams = { place_id: placeId }
  } else {
    ctx.status = 400
    ctx.body = {
      error: 'Either address or placeId query parameter is required'
    }
    return
  }

  try {

    // make the request to the geocode service
    const geocoderResult = await client.geocode({
      params: { ...geocodeParams, key: apiKey },
      timeout: 1000 // milliseconds
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
      geometry: {
        $geoWithin: {
          $geometry: boundaries[0].geometry
        }
      }
    })

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
