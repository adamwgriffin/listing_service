import { faker } from "@faker-js/faker";
import { type HydratedDocument } from "mongoose";
import request from "supertest";
import { buildApp } from "../../app";
import { ListingData, randomPointsWithinPolygon } from "../../lib/random_data";
import { IListing } from "../../models/ListingModel";
import type { ListingSearchResponse } from "../../types/listing_search_response_types";
import { type ListingFilterParams } from "../../zod_schemas/listingSearchParamsSchema";
import listingTemplate from "../data/listingTemplate";
import {
  FremontViewportBounds,
  FremontViewportBoundsPolygon
} from "../testHelpers";

const numericRangeFilters = {
  price_min: 151000,
  price_max: 152000,
  beds_min: 1,
  beds_max: 2,
  baths_min: 1,
  baths_max: 2,
  sqft_min: 2400,
  sqft_max: 2500,
  year_built_min: 1966,
  year_built_max: 1967,
  lot_size_min: 7300,
  lot_size_max: 7400
};

const listingDataThatMatchesNumberRangeFilters = (
  f: Partial<ListingFilterParams>
): Partial<ListingData> => {
  return {
    listPrice: faker.number.int({ min: f.price_min, max: f.price_max }),
    beds: faker.number.int({ min: f.beds_min, max: f.beds_max }),
    baths: faker.number.int({ min: f.baths_min, max: f.baths_max }),
    sqft: faker.number.int({ min: f.sqft_min, max: f.sqft_max }),
    yearBuilt: faker.number.int({
      min: f.year_built_min,
      max: f.year_built_max
    }),
    lotSize: faker.number.int({ min: f.lot_size_min, max: f.lot_size_max })
  };
};

const app = buildApp();

describe("when filters are included in the request", () => {
  describe("when number range filters are present", () => {
    let matchingListing: HydratedDocument<IListing>;
    let nonMatchingListing: HydratedDocument<IListing>;

    beforeAll(async () => {
      const points = randomPointsWithinPolygon(FremontViewportBoundsPolygon, 2);
      const matchingData =
        listingDataThatMatchesNumberRangeFilters(numericRangeFilters);
      matchingListing = await app.context.db.listing.createListing({
        ...listingTemplate,
        ...matchingData,
        geometry: points[0]
      });
      nonMatchingListing = await app.context.db.listing.createListing({
        ...listingTemplate,
        ...matchingData,
        listPrice: numericRangeFilters.price_max + 100_000,
        geometry: points[1]
      });
    });

    afterAll(async () => {
      await matchingListing.deleteOne();
      await nonMatchingListing.deleteOne();
    });

    it("finds listings in the correct ranges", async () => {
      const res = await request(app.callback())
        .get("/listing/search/bounds")
        .query({ ...FremontViewportBounds, ...numericRangeFilters });
      const data: ListingSearchResponse = res.body;
      // expect(data.listings.length).toEqual(1);
      const listingIds = data.listings.map((l) => l._id.toString());
      expect(listingIds).toContain(matchingListing._id.toString());
      expect(listingIds).not.toContain(nonMatchingListing._id.toString());
    });
  });
});
