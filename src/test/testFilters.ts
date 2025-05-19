import request from "supertest";
import type {
  ListingResultWithSelectedFields,
  ListingSearchResponse
} from "../types/listing_search_response_types";
import type Application from "koa";

/** An object that stores the fields of a listing where each field has an object
 * with filters that the field should match.
 */
const NumberRangeFilters: Record<string, Record<string, number>> = {
  beds: {
    beds_min: 2,
    beds_max: 3
  },
  baths: {
    baths_min: 2,
    baths_max: 4
  },
  listPrice: {
    price_min: 500000,
    price_max: 900000
  },
  sqft: {
    sqft_min: 1000,
    sqft_max: 1754
  }
};

function testFiltersToQueryParams(filters: typeof NumberRangeFilters) {
  return Object.values(filters).reduce(
    (acc, curr) => ({ ...acc, ...curr }),
    {}
  );
}

const allFiltersWithinNumericRange = (
  listing: ListingResultWithSelectedFields
) => {
  return Object.entries(NumberRangeFilters).every(([field, filterRange]) => {
    const [min, max] = Object.values(filterRange);
    const fieldValue = listing[field as keyof typeof listing] as number;
    return fieldValue >= min && fieldValue <= max;
  });
};

export const testFilters = (
  app: Application,
  endpoint: string,
  query: object
) => {
  describe("when filters are included in the request", () => {
    it("finds listings in the correct range for filters that use a numeric range", async () => {
      const filters = testFiltersToQueryParams(NumberRangeFilters);
      const res = await request(app.callback())
        .get(endpoint)
        .query({ ...query, ...filters });
      const data: ListingSearchResponse = res.body;
      expect(data.listings.length).toBeGreaterThanOrEqual(1);
      expect(data.listings.every(allFiltersWithinNumericRange)).toBe(true);
    });

    it("finds listings with the correct status", async () => {
      const statuses = ["active", "pending"];
      const res = await request(app.callback())
        .get(endpoint)
        .query({ ...query, status: statuses.join(",") });
      const data: ListingSearchResponse = res.body;
      expect(data.listings.length).toBeGreaterThanOrEqual(1);
      const correctStatuses = data.listings.every((listing) =>
        statuses.includes(listing.status)
      );
      expect(correctStatuses).toBe(true);
      const incorrectStatuses = data.listings.some((l) =>
        ["sold", "rented"].includes(l.status)
      );
      expect(incorrectStatuses).toBe(false);
    });
  });
};
