import { booleanPointInPolygon } from "@turf/turf";
import { HydratedDocument } from "mongoose";
import request from "supertest";
import { buildApp } from "../../../../app";
import { randomPointsWithinPolygon } from "../../../../lib/random_data";
import ListingModel, { IListing } from "../../../../models/ListingModel";
import listingTemplate from "../../../data/listingTemplate";
import {
  FremontViewportBounds,
  FremontViewportBoundsPolygon,
  listingsInsideBoundary
} from "../../../testHelpers";

const app = buildApp();

describe("GET /listing/search/bounds", () => {
  describe("bounds params", () => {
    let listing: HydratedDocument<IListing>;

    beforeAll(async () => {
      const point = randomPointsWithinPolygon(
        FremontViewportBoundsPolygon,
        1
      )[0];
      listing = await app.context.db.listing.createListing({
        ...listingTemplate,
        geometry: point
      });
    });

    afterAll(async () => {
      await ListingModel.deleteOne({ _id: listing._id });
    });

    it("validates that all bounds params are present", async () => {
      const res = await request(app.callback())
        .get("/listing/search/bounds")
        .query({ bounds_north: 47.69011227856514 });
      expect(res.status).toBe(400);
    });

    it("only returns listings that are inside the bounds", async () => {
      expect(
        booleanPointInPolygon(
          listing.geometry.coordinates,
          FremontViewportBoundsPolygon
        )
      ).toBe(true);
      const res = await request(app.callback())
        .get("/listing/search/bounds")
        .query(FremontViewportBounds);
      expect(
        listingsInsideBoundary(FremontViewportBoundsPolygon, res.body.listings)
      ).toBe(true);
    });
  });
});
