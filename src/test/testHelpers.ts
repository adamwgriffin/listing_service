import { booleanPointInPolygon } from "@turf/turf";
import type { MultiPolygon, Polygon } from "geojson";
import BoundaryModel from "../models/BoundaryModel";
import ListingModel from "../models/ListingModel";
import { boundsParamsToGeoJSONPolygon } from "../services/listingSearchService";
import { type ListingResult } from "../types/listing_search_response_types";

export const FremontViewportBounds = {
  bounds_north: 47.69011227856514,
  bounds_east: -122.32789118536581,
  bounds_south: 47.62356960805306,
  bounds_west: -122.38144953497519
};

export const FremontViewportBoundsPolygon = boundsParamsToGeoJSONPolygon(
  FremontViewportBounds
);

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

export const getNonExistingBoundaryId = () =>
  new BoundaryModel()._id.toString();
