import { differenceInDays } from 'date-fns'
import { type ListingDetailResultWithSelectedFields } from '../types/listing_search_response_types'

export default (listingDetail: ListingDetailResultWithSelectedFields) => {
  const daysOnMarket = differenceInDays(
    listingDetail.soldDate || new Date(),
    listingDetail.listedDate
  )
  return {
    ...listingDetail,
    daysOnMarket
  }
}
