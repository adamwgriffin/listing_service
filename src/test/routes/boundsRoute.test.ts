import { booleanPointInPolygon } from "@turf/turf";
import request from "supertest";
import app from "../../app";
import { ListingQueryResult } from "../../respositories/ListingRepository";
import type { ListingSearchResponse } from "../../types/listing_search_response_types";
import listingTemplate from "../data/listingTemplate";
import {
  BoundsExcludingPartOfFremontBoundary,
  listingsInsideBoundary
} from "../testHelpers";

const { insideBoundsPoint, outsideBoundsPoint, boundsParams, boundsPoly } =
  BoundsExcludingPartOfFremontBoundary;

describe("GET /listing/search/bounds", () => {
  describe("bounds params", () => {
    let listingInsideBounds: ListingQueryResult;
    let listingOutsideBounds: ListingQueryResult;

    beforeAll(async () => {
      listingInsideBounds = await app.context.db.listing.createListing({
        ...listingTemplate,
        geometry: insideBoundsPoint
      });
      listingOutsideBounds = await app.context.db.listing.createListing({
        ...listingTemplate,
        geometry: outsideBoundsPoint
      });
    });

    afterAll(async () => {
      await app.context.db.listing.deleteListingsById([
        listingInsideBounds._id,
        listingOutsideBounds._id
      ]);
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
          listingInsideBounds.geometry.coordinates,
          boundsPoly
        )
      ).toBe(true);
      const res = await request(app.callback())
        .get("/listing/search/bounds")
        .query(boundsParams);
      const data: ListingSearchResponse = res.body;
      const listingIds = data.listings.map((l) => l._id);
      expect(listingIds).toContain(listingInsideBounds._id);
      expect(listingIds).not.toContain(listingOutsideBounds._id);
      expect(listingsInsideBoundary(boundsPoly, data.listings)).toBe(true);
    });
  });
});
