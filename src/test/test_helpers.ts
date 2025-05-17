import { booleanPointInPolygon, MultiPolygon, Polygon } from "@turf/turf";
import { type ListingResultWithSelectedFields } from "../types/listing_search_response_types";
import ListingModel from "../models/ListingModel";

export const listingsInsideBoundary = (
  bounds: MultiPolygon | Polygon,
  listings: ListingResultWithSelectedFields[]
) => {
  return listings.every((listing) =>
    booleanPointInPolygon([listing.longitude, listing.latitude], bounds)
  );
};

export const getRandomListingIds = async (count: number) => {
  const listings = await ListingModel.find({}, { _id: 1 }).limit(count).lean();
  if (listings.length !== count)
    throw new Error("Not enough listings found in test database");
  return listings.map((l) => l._id.toString());
};

/** Get a listing id that does not exist in the database */
export const getNonExistingListingId = () => new ListingModel()._id.toString();
