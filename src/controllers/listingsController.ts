import Listing from '../models/ListingModel'
import { DefaultListingResultFields } from '../config'

export const getListingsById = async (ctx) => {
  try {
    const ids = ctx.params.ids.split(',')
    const listings = await Listing.find({ '_id': { $in: ids } }, DefaultListingResultFields)
    ctx.body = {
      listings: listings
    }
  } catch (error) {
    console.error(error)
    ctx.body = { error }
    ctx.status = 400
  }
}
