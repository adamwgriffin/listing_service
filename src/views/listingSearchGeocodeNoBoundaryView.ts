import { AddressGeometry } from "@googlemaps/google-maps-services-js";
import type {
  GeocodeBoundarySearchResponse,
  ListingDetailResult
} from "../types/listing_search_response_types";

export default (
  viewport: AddressGeometry["viewport"],
  listingDetail: ListingDetailResult | null | undefined = null
): GeocodeBoundarySearchResponse => {
  return listingDetail ? { listingDetail } : { viewport };
};
