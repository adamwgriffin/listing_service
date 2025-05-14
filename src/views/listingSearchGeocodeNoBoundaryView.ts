import { AddressGeometry } from "@googlemaps/google-maps-services-js";
import type {
  GeocodeBoundarySearchResponse,
  ListingDetailResultWithSelectedFields
} from "../types/listing_search_response_types";

export default (
  viewport: AddressGeometry["viewport"],
  listingDetail: ListingDetailResultWithSelectedFields | null | undefined = null
): GeocodeBoundarySearchResponse => {
  return listingDetail ? { listingDetail } : { viewport };
};
