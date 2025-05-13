import type { Context } from 'koa'
import { Types } from 'mongoose'
import listingDetailView from '../views/listingDetailView'

// TODO: Use Zod to validate this & add a view
export const getListingById = async (ctx: Context) => {
  const { id } = ctx.params
  if (!Types.ObjectId.isValid(id)) {
    ctx.status = 422
    ctx.body = { message: `Invalid ID ${id}` }
    return
  }
  const listing = await ctx.repositories.listing.findByListingId(id)
  ctx.assert(listing, 404, `Listing not found with ID ${id}`)
  ctx.body = listingDetailView(listing)
}
