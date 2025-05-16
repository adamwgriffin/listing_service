import { booleanPointInPolygon, MultiPolygon, Polygon } from "@turf/turf";
import { type ListingResultWithSelectedFields } from "../types/listing_search_response_types";

export const listingsInsideBoundary = (
  bounds: MultiPolygon | Polygon,
  listings: ListingResultWithSelectedFields[]
) => {
  return listings.every((listing) =>
    booleanPointInPolygon(
      [listing.longitude, listing.latitude],
      bounds
    )
  );
};
