import { Types } from 'mongoose'
import Listing from '../models/listingModel'

export const listing = async (ctx) => {
  try {
    const { id } = ctx.params
    if (!Types.ObjectId.isValid(id)) {
      ctx.status = 422
      ctx.body = { message: `Invalid ID ${id}` }
      return
    }
    const listing = await Listing.findById(id)
    if (!listing) {
      ctx.status = 404
      ctx.body = { message: `Listing not found with ID ${id}` }
    } else {
      ctx.body = { listing }
    }
  } catch (error) {
    ctx.body = { error }
    ctx.status = 400
  }
}

export const create = async (ctx) => {
  const { listPrice } = ctx.request.body
  try {
    const listing = await Listing.create({ listPrice })
    ctx.status = 201
    ctx.body = { listing }
  } catch (error) {
    ctx.body = { error }
    ctx.status = 400
  }
}
