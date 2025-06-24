import { subDays } from "date-fns";
import type { FilterQuery, ProjectionType } from "mongoose";
import { type IListing } from "../models/ListingModel";
import { type ListingFilterParams } from "../zod_schemas/listingSearchParamsSchema";

/**
 * Used for mongodb's $project section to select the fields we want to return in
 * the response.
 */
export const ListingResultProjectionFields = {
  propertyType: 1,
  status: 1,
  listPrice: 1,
  soldPrice: 1,
  listedDate: 1,
  beds: 1,
  baths: 1,
  sqft: 1,
  lotSize: 1,
  neighborhood: 1,
  description: 1,
  address: 1,
  latitude: { $arrayElemAt: ["$geometry.coordinates", 1] },
  longitude: { $arrayElemAt: ["$geometry.coordinates", 0] },
  rental: 1,
  photoGallery: 1,
  openHouses: 1,
  placeId: 1,
  slug: 1
} as const satisfies ProjectionType<IListing>;

export const ListingDetailResultProjectionFields = {
  ...ListingResultProjectionFields,
  yearBuilt: 1,
  soldDate: 1,
  propertyDetails: 1
} as const satisfies ProjectionType<IListing>;

/**
 * Create a MongoDB $sort query
 *
 * 1 == ascending, e.g., 1-10
 *
 * -1 == descending, e.g., 10-1
 *
 * @example
 * listingSortQuery({ "sort_by": "listedDate", "sort_direction": "asc" })
 * // { "listedDate": 1 }
 */
export const listingSortQuery = (
  queryParams: Partial<ListingFilterParams>
): FilterQuery<IListing> => {
  const sortBy = queryParams.sort_by || "listedDate";
  const sortDirection = queryParams.sort_direction === "asc" ? 1 : -1;
  return { [sortBy]: sortDirection };
};

/**
 * Generates a MongoDB query object that searches within a min/max range for the given field.
 *
 * @example
 * numberRangeQuery('listPrice', 100000, 200000)
 * // Returns { "listPrice": { $gte: 100000, $lte: 200000 } }
 */
export const numberRangeQuery = (
  field: string,
  min: number | undefined,
  max: number | undefined
) => {
  const query: FilterQuery<IListing> = { [field]: {} };
  if (min) {
    query[field].$gte = min;
  }
  if (max) {
    query[field].$lte = max;
  }
  return query;
};

export const openHouseQuery = (
  open_house_after: string | undefined,
  open_house_before: string | undefined
): FilterQuery<IListing> => {
  const query: { $gte?: Date; $lte?: Date } = {};
  if (open_house_after) {
    query.$gte = new Date(open_house_after);
  }
  if (open_house_before) {
    query.$lte = new Date(open_house_before);
  }
  return {
    openHouses: {
      $elemMatch: { start: query }
    }
  };
};

/**
 * Convert listing search filter params into an array of MongoDB queries for each filter.
 *
 * @example
 * buildFilterQueries({ "price_min": 100000, "waterfront": "true" })
 * // Returns [{ "listPrice": { $gte: 100000} }, { "waterfront": true }]
 */
export const buildFilterQueries = (
  q: Partial<ListingFilterParams>
): FilterQuery<IListing>[] => {
  const filters = [];

  filters.push({ status: q.status ? { $in: q.status } : "active" });

  if (q.property_type) {
    filters.push({
      propertyType: {
        $in: q.property_type
      }
    });
  }
  if (q.rental === true) {
    filters.push({ rental: true });
  } else {
    // Need to explicitly exclude rentals, otherwise if the request does not
    // supply the rental param it will return everything that has status: active
    // by default
    filters.push({ rental: { $exists: false } });
  }
  if (q.sold_in_last) {
    filters.push({
      soldDate: {
        $gte: subDays(new Date(), q.sold_in_last)
      }
    });
  }
  if (q.open_house_after || q.open_house_before) {
    filters.push(openHouseQuery(q.open_house_after, q.open_house_before));
  }

  // Range queries
  if (q.price_min || q.price_max) {
    filters.push(numberRangeQuery("listPrice", q.price_min, q.price_max));
  }
  if (q.beds_min || q.beds_max) {
    filters.push(numberRangeQuery("beds", q.beds_min, q.beds_max));
  }
  if (q.baths_min || q.baths_max) {
    filters.push(numberRangeQuery("baths", q.baths_min, q.baths_max));
  }
  if (q.sqft_min || q.sqft_max) {
    filters.push(numberRangeQuery("sqft", q.sqft_min, q.sqft_max));
  }
  if (q.year_built_min || q.year_built_max) {
    filters.push(
      numberRangeQuery("yearBuilt", q.year_built_min, q.year_built_max)
    );
  }
  if (q.lot_size_min || q.lot_size_max) {
    filters.push(numberRangeQuery("lotSize", q.lot_size_min, q.lot_size_max));
  }

  // Boolean queries. We have to check the actual type for boolean params
  // because if the value is false it means to exclude records. A simple
  // truthiness check wouldn't accomplish that.
  if (typeof q.waterfront === "boolean") {
    filters.push({ waterfront: q.waterfront });
  }
  if (typeof q.view === "boolean") {
    filters.push({ view: q.view });
  }
  if (typeof q.fireplace === "boolean") {
    filters.push({ fireplace: q.fireplace });
  }
  if (typeof q.basement === "boolean") {
    filters.push({ basement: q.basement });
  }
  if (typeof q.garage === "boolean") {
    filters.push({ garage: q.garage });
  }
  if (typeof q.new_construction === "boolean") {
    filters.push({ newConstruction: q.new_construction });
  }
  if (typeof q.pool === "boolean") {
    filters.push({ pool: q.pool });
  }
  if (typeof q.air_conditioning === "boolean") {
    filters.push({ airConditioning: q.air_conditioning });
  }

  return filters;
};
