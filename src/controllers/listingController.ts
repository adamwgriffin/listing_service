import type { Context } from 'koa'
import { Types } from 'mongoose'
import Listing from '../models/ListingModel'
import { ListingDetailResultProjectionFields } from '../config'
import { daysOnMarket } from '../lib/listing_search_helpers'

export const getListingById = async (ctx: Context) => {
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
