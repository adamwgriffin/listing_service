import { faker } from "@faker-js/faker";
import { type HydratedDocument } from "mongoose";
import request from "supertest";
import { buildApp } from "../../app";
import { ListingData, randomPointsWithinPolygon } from "../../lib/random_data";
import ListingModel, { IListing } from "../../models/ListingModel";
import type { ListingSearchResponse } from "../../types/listing_search_response_types";
import { type ListingFilterParams } from "../../zod_schemas/listingSearchParamsSchema";
import listingTemplate from "../data/listingTemplate";
import {
  FremontViewportBounds,
  FremontViewportBoundsPoly
} from "../testHelpers";
import { PropertyStatuses, PropertyTypes } from "../../models/ListingModel";

const filterParams = {
  price_min: 151_000,
  price_max: 152_000,
  beds_min: 1,
  beds_max: 2,
  baths_min: 1,
  baths_max: 2,
  sqft_min: 2_400,
  sqft_max: 2_500,
  year_built_min: 1966,
  year_built_max: 1967,
  lot_size_min: 7_300,
  lot_size_max: 7_400,
  waterfront: true,
  view: true,
  fireplace: true,
  basement: true,
  garage: true,
  new_construction: false,
  pool: false,
  air_conditioning: true
};

const listingDataThatMatchesFilters = (
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
    lotSize: faker.number.int({ min: f.lot_size_min, max: f.lot_size_max }),
    waterfront: f.waterfront,
    view: f.view,
    fireplace: f.fireplace,
    basement: f.basement,
    garage: f.garage,
    newConstruction: f.new_construction,
    pool: f.pool,
    airConditioning: f.air_conditioning
  };
};

const app = buildApp();

describe("filters", () => {
  describe("when standard filters are included in the request", () => {
    let matchingListing: HydratedDocument<IListing>;
    let nonMatchingListing: HydratedDocument<IListing>;

    beforeAll(async () => {
      const points = randomPointsWithinPolygon(FremontViewportBoundsPoly, 2);
      const matchingData = listingDataThatMatchesFilters(filterParams);
      matchingListing = await app.context.db.listing.createListing({
        ...listingTemplate,
        ...matchingData,
        geometry: points[0]
      });
      nonMatchingListing = await app.context.db.listing.createListing({
        ...listingTemplate,
        ...matchingData,
        listPrice: filterParams.price_max + 100_000,
        newConstruction: !filterParams.new_construction,
        geometry: points[1]
      });
    });

    afterAll(async () => {
      await matchingListing.deleteOne();
      await nonMatchingListing.deleteOne();
    });

    it("finds listings that match the filters", async () => {
      const res = await request(app.callback())
        .get("/listing/search/bounds")
        .query({
          ...FremontViewportBounds,
          ...filterParams
        });
      const data: ListingSearchResponse = res.body;
      const listingIds = data.listings.map((l) => l._id.toString());
      expect(listingIds).toContain(matchingListing._id.toString());
      expect(listingIds).not.toContain(nonMatchingListing._id.toString());
    });
  });

  describe("status", () => {
    const listings: HydratedDocument<IListing>[] = [];

    beforeAll(async () => {
      const points = randomPointsWithinPolygon(
        FremontViewportBoundsPoly,
        PropertyStatuses.length
      );
      for (let i = 0; i < PropertyStatuses.length; i++) {
        const listing = await app.context.db.listing.createListing({
          ...listingTemplate,
          status: PropertyStatuses[i],
          geometry: points[i]
        });
        listings.push(listing);
      }
    });

    afterAll(async () => {
      const listingIds = listings.map((l) => l._id.toString());
      await ListingModel.deleteMany({
        _id: { $in: listingIds }
      });
    });

    it("validates the status type", async () => {
      const res = await request(app.callback())
        .get("/listing/search/bounds")
        .query({
          ...FremontViewportBounds,
          status: "sold,invalid_type"
        });
      expect(res.status).toBe(400);
    });

    describe("when the status param is included", () => {
      it("only returns the statuses that are requested", async () => {
        const requestedStatuses = ["pending", "sold"];
        const res = await request(app.callback())
          .get("/listing/search/bounds")
          .query({
            ...FremontViewportBounds,
            status: requestedStatuses.join(",")
          });
        const data: ListingSearchResponse = res.body;
        expect(
          data.listings.every((l) => requestedStatuses.includes(l.status))
        ).toBe(true);
      });
    });

    describe("when the status param is not included", () => {
      it("it only returns listings with an active status", async () => {
        const res = await request(app.callback())
          .get("/listing/search/bounds")
          .query(FremontViewportBounds);
        const data: ListingSearchResponse = res.body;
        expect(data.listings.every((l) => l.status === "active")).toBe(true);
      });
    });
  });

  describe("property_type", () => {
    const listings: HydratedDocument<IListing>[] = [];

    beforeAll(async () => {
      const points = randomPointsWithinPolygon(
        FremontViewportBoundsPoly,
        PropertyTypes.length
      );
      for (let i = 0; i < PropertyTypes.length; i++) {
        const listing = await app.context.db.listing.createListing({
          ...listingTemplate,
          propertyType: PropertyTypes[i],
          geometry: points[i]
        });
        listings.push(listing);
      }
    });

    afterAll(async () => {
      const listingIds = listings.map((l) => l._id.toString());
      await ListingModel.deleteMany({
        _id: { $in: listingIds }
      });
    });

    describe("when the property_type param is included", () => {
      it("only returns the property types that are requested", async () => {
        const requestedPropertyTypes = ["manufactured", "land"];
        const res = await request(app.callback())
          .get("/listing/search/bounds")
          .query({
            ...FremontViewportBounds,
            property_type: requestedPropertyTypes.join(",")
          });
        const data: ListingSearchResponse = res.body;
        // The default response doesn't include property type atm so we have to
        // get the listings from the database
        const listingIds = data.listings.map((l) => l._id);
        const foundListings = await ListingModel.find({
          _id: { $in: listingIds }
        });
        expect(
          foundListings.every((l) =>
            requestedPropertyTypes.includes(l.propertyType)
          )
        ).toBe(true);
      });
    });

    describe("when the property_type param is not included", () => {
      it("only returns all property types", async () => {
        const res = await request(app.callback())
          .get("/listing/search/bounds")
          .query(FremontViewportBounds);
        const data: ListingSearchResponse = res.body;
        // The default response doesn't include property type atm so we have to
        // get the listings from the database
        const listingIds = data.listings.map((l) => l._id);
        const foundListings = await ListingModel.find({
          _id: { $in: listingIds }
        });
        expect(
          foundListings.every((l) => PropertyTypes.includes(l.propertyType))
        ).toBe(true);
      });
    });
  });

  describe("rentals", () => {
    let rentalListing: HydratedDocument<IListing>;
    let nonRentalListing: HydratedDocument<IListing>;

    beforeAll(async () => {
      const points = randomPointsWithinPolygon(FremontViewportBoundsPoly, 1);
      rentalListing = await app.context.db.listing.createListing({
        ...listingTemplate,
        rental: true,
        geometry: points[0]
      });
      nonRentalListing =
        await app.context.db.listing.createListing(listingTemplate);
    });

    afterAll(async () => {
      await ListingModel.deleteMany({
        _id: {
          $in: [rentalListing._id.toString(), nonRentalListing._id.toString()]
        }
      });
    });

    describe("when the rental param is included and set to true", () => {
      it("only rentals are returned in the response", async () => {
        const res = await request(app.callback())
          .get("/listing/search/bounds")
          .query({
            ...FremontViewportBounds,
            rental: true
          });
        const data: ListingSearchResponse = res.body;
        expect(data.listings.every((l) => l.rental === true)).toBe(true);
      });
    });

    describe("when the rental param is not included in the request", () => {
      it("no rentals are returned in the response", async () => {
        const res = await request(app.callback())
          .get("/listing/search/bounds")
          .query(FremontViewportBounds);
        const data: ListingSearchResponse = res.body;
        expect(data.listings.every((l) => !l.rental)).toBe(true);
      });
    });
  });
});
