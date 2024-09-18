import type { Context } from 'koa'
import Boundary from '../models/BoundaryModel'

export const createBoundary = async (ctx: Context) => {
  const boundary = await Boundary.create(ctx.request.body)
  ctx.status = 201
  ctx.body = boundary
}

export const searchBoundary = async (ctx: Context) => {
  const { lat, lng } = ctx.request.query
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
}
