import type { MultiPolygon, Polygon } from "geojson";
import { MongoServerError } from "mongodb";
import { type HydratedDocument } from "mongoose";
import { getPaginationParams } from "../lib";
import { type ListingData } from "../lib/random_data";
import ListingModel, { IListing } from "../models/ListingModel";
import {
  buildFilterQueries,
  ListingDetailResultProjectionFields,
  ListingResultProjectionFields,
  listingSortQuery
} from "../queries/listingQueries";
import {
  ListingDetailResult,
  ListingResult
} from "../types/listing_search_response_types";
import { type GeocodeBoundaryQueryParams } from "../zod_schemas/geocodeBoundarySearchSchema";
import { ListingAddress } from "../zod_schemas/listingSchema";

export type FindWithinBoundsResult = {
  metadata: { numberAvailable: number }[];
  listings: ListingResult[];
};

export interface IListingRepository {
  findByPlaceIdOrAddress: (
    placeId: string,
    address: ListingAddress
  ) => Promise<ListingDetailResult | null>;

  findWithinBounds: (
    boundaryGeometry: Polygon | MultiPolygon,
    query: GeocodeBoundaryQueryParams
  ) => Promise<FindWithinBoundsResult[]>;

  findByPlaceId: (placeId: string) => Promise<ListingDetailResult | null>;

  findByListingId: (placeId: string) => Promise<ListingDetailResult | null>;

  findByListingIds: (ids: string[]) => Promise<ListingResult[]>;

  /**
   * Create a listing record.
   *
   * @note The save hook that adds a unique slug can sometimes fail in
   * multi-threaded environments so this function attemps to recover from those
   * errors by retrying. You can opt out of this behavior by passing 0 as the
   * maxAttempts argument.
   */
  createListing: (
    listing: ListingData,
    maxAttempts?: number
  ) => Promise<HydratedDocument<IListing>>;
}

/**
 * Find a listing by placeId first. If that fails, try address instead.
 */
export const findByPlaceIdOrAddress = async (
  placeId: string,
  address: ListingAddress
) => {
  const addressQuery: { [index: string]: string } = {};
  for (const k in address) {
    const v = address[k as keyof typeof address];
    if (typeof v === "string") {
      addressQuery[`address.${k}`] = v;
    }
  }
  return ListingModel.findOne(
    { $or: [{ placeId }, addressQuery] },
    ListingDetailResultProjectionFields
  ).lean<ListingDetailResult>();
};

export const findWithinBounds = async (
  boundaryGeometry: Polygon | MultiPolygon,
  query: GeocodeBoundaryQueryParams
) => {
  const { page_size, page_index } = getPaginationParams(query);
  return ListingModel.aggregate<FindWithinBoundsResult>([
    {
      $match: {
        $and: [
          {
            geometry: {
              $geoWithin: {
                $geometry: boundaryGeometry
              }
            }
          },
          ...buildFilterQueries(query)
        ]
      }
    },
    { $sort: listingSortQuery(query) },
    // Using the aggregation pipline in combination with $facet allows us to get
    // the total number of documents that match the query when using $skip &
    // $limit for pagination. It allows us to count the total results from the
    // $match stage before they go through the $skip/$limit stages that will
    // reduce the number of results returned.
    {
      $facet: {
        metadata: [
          // This part counts the total. "numberAvailable" is just a name for the field
          { $count: "numberAvailable" }
        ],
        listings: [
          // Using $skip allows us to move ahead to each page in the results set
          // by skipping the previous page results we have already seen, while
          // $limit only returns the amount per page. Together they create a
          // slice of the result set represented as a "page"
          { $skip: page_index * page_size },
          { $limit: page_size },
          { $project: ListingResultProjectionFields }
        ]
      }
    }
  ]);
};

export const findByPlaceId = async (placeId: string) => {
  return ListingModel.findOne(
    { placeId },
    ListingDetailResultProjectionFields
  ).lean<ListingDetailResult>();
};

export const findByListingId = async (id: string) => {
  return ListingModel.findById(
    id,
    ListingDetailResultProjectionFields
  ).lean<ListingDetailResult>();
};

export const findByListingIds = async (ids: string[]) => {
  return ListingModel.find(
    { _id: { $in: ids } },
    ListingResultProjectionFields
  ).lean<ListingResult[]>();
};

const isDuplicateSlugError = (error: unknown) => {
  return (
    error instanceof MongoServerError &&
    error.code === 11000 &&
    error?.keyPattern?.slug === 1
  );
};

export const createListing = async (data: ListingData, maxAttempts = 5) => {
  let count = 0;

  while (count <= maxAttempts) {
    try {
      const listing = await ListingModel.create(data);
      return listing;
    } catch (error) {
      if (isDuplicateSlugError(error) && maxAttempts !== 0) {
        count++;
      } else {
        throw error;
      }
    }
  }

  throw new Error(
    `Failed to generate a unique slug after ${maxAttempts} attempts`
  );
};

export const ListingRepository: IListingRepository = {
  findByPlaceIdOrAddress,
  findWithinBounds,
  findByPlaceId,
  findByListingId,
  findByListingIds,
  createListing
};
