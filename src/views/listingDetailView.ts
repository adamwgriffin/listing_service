import { differenceInDays } from "date-fns";
import { type ListingDetailResult } from "../types/listing_search_response_types";

export default (listingDetail: ListingDetailResult) => {
  const daysOnMarket = differenceInDays(
    listingDetail.soldDate || new Date(),
    listingDetail.listedDate
  );
  return {
    ...listingDetail,
    daysOnMarket
  };
};
