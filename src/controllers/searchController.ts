import type { Context } from 'koa'
import Listing from '../models/listingModel'
// import multiPolygon from '../test/test_data/boundary_data/fremont_geojson'
import multiPolygon from '../test/test_data/boundary_data/ballard_geojson'

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
  try {
    const listings = await Listing.find({
      geometry: {
        $geoWithin: {
          $geometry: multiPolygon
        }
      }
    })
    ctx.body = listings
  } catch (error) {
    ctx.status = 500
    ctx.body = { message: error.message }
  }
}
