import { booleanPointInPolygon, MultiPolygon, Polygon } from "@turf/turf";
import { type ListingResult } from "../types/listing_search_response_types";
import ListingModel from "../models/ListingModel";
import BoundaryModel from '../models/BoundaryModel';

export const listingsInsideBoundary = (
  bounds: MultiPolygon | Polygon,
  listings: ListingResult[]
) => {
  return listings.every((listing) =>
    booleanPointInPolygon([listing.longitude, listing.latitude], bounds)
  );
};

/** Get a listing id that does not exist in the database */
export const getNonExistingListingId = () => new ListingModel()._id.toString();

export const getNonExistingBoundaryId = () => new BoundaryModel()._id.toString();
