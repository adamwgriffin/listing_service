import type { Context } from 'koa'
import Boundary from '../models/BoundaryModel'

export const createBoundary = async (ctx: Context) => {
  try {
    const boundary = await Boundary.create(ctx.request.body)
    ctx.status = 201
    ctx.body = boundary
  } catch (error) {
    ctx.body = { error }
    ctx.status = 400
  }
}

export const searchBoundary = async (ctx: Context) => {
  const { lat, lng } = ctx.request.query
  try {
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
    ctx.body = boundaries
  } catch (error) {
    ctx.status = 500
    ctx.body = { message: error.message }
  }
}
