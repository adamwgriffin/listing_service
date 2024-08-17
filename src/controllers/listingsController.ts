import Listing from '../models/ListingModel'
import { ListingResultProjectionFields } from '../config'

export const getListingsById = async (ctx) => {
  try {
    const ids = ctx.params.ids.split(',')
    const listings = await Listing.find({ '_id': { $in: ids } }, ListingResultProjectionFields)
    ctx.body = {
      listings: listings
    }
  } catch (error) {
    console.error(error)
    ctx.body = { error }
    ctx.status = 400
  }
}
