import type { Context } from 'koa'
import { Types } from 'mongoose'
import Listing from '../models/ListingModel'
import { ListingDetailResultProjectionFields } from '../config'
import { daysOnMarket } from '../lib/listing_search_helpers'

export const createListing = async (ctx: Context) => {
  const listing = await Listing.create(ctx.request.body)
  ctx.status = 201
  ctx.body = listing
}

export const readListing = async (ctx: Context) => {
  const { id } = ctx.params
  if (!Types.ObjectId.isValid(id)) {
    ctx.status = 422
    ctx.body = { message: `Invalid ID ${id}` }
    return
  }
  const listing = await Listing.findById(
    id,
    ListingDetailResultProjectionFields
  )
  if (!listing) {
    ctx.status = 404
    ctx.body = { message: `Listing not found with ID ${id}` }
  } else {
    ctx.body = {
      ...listing.toObject(),
      daysOnMarket: daysOnMarket(listing.listedDate, listing.soldDate)
    }
  }
}

export const updateListing = async (ctx: Context) => {
  const { id } = ctx.params
  const updatedListing = await Listing.findByIdAndUpdate(id, ctx.request.body, {
    new: true
  })
  if (!updatedListing) {
    ctx.status = 404
    ctx.body = { message: `Listing with ID ${id} not found` }
  } else {
    ctx.body = updatedListing
  }
}

export const deleteListing = async (ctx: Context) => {
  const { id } = ctx.params
  const deletedListing = await Listing.findByIdAndDelete(id)
  if (!deletedListing) {
    ctx.status = 404
    ctx.body = { message: `Listing with ID ${id} not found` }
  } else {
    ctx.status = 204
  }
}
