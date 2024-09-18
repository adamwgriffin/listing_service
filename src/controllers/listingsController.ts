import Listing from '../models/ListingModel'
import { ListingResultProjectionFields } from '../config'

export const getListingsById = async (ctx) => {
  const ids = ctx.params.ids.split(',')
  const listings = await Listing.find(
    { _id: { $in: ids } },
    ListingResultProjectionFields
  )
  ctx.body = {
    listings: listings
  }
}
