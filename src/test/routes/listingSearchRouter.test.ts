import request from "supertest";
import { buildApp } from "../../app";
import Boundary from "../../models/BoundaryModel";
import type { ListingSearchResponse } from "../../types/listing_search_response_types";

const FremontViewportBounds = {
  bounds_north: 47.69011227856514,
  bounds_east: -122.32789118536581,
  bounds_south: 47.62356960805306,
  bounds_west: -122.38144953497519
};

const InsideBoundsPlaceId = "ChIJx-PUpKcVkFQRuyjbZcMero4";
const OutsideBoundsPlaceId = "ChIJgSaVY10UkFQRatRdh9A5h-k";

const app = buildApp();

describe("listingSearchRouter", () => {
  describe("GET /listing/search/boundary/:id", () => {
    it("returns a successful status when a boundary with the given ID exists", async () => {
      const boundary = await Boundary.findOne().lean();
      if (!boundary) throw new Error("No boundaries found in test database");
      const res = await request(app.callback()).get(
        `/listing/search/boundary/${boundary._id}`
      );
      expect(res.status).toBe(200);
    });

    it("validates the boundary ID params type", async () => {
      const res = await request(app.callback()).get(
        `/listing/search/boundary/bad_id_type`
      );
      expect(res.status).toBe(400);
    });

    it("returns a not found status when a boundary with the given ID does not exist", async () => {
      const nonExistentId = new Boundary()._id;
      const res = await request(app.callback()).get(
        `/listing/search/boundary/${nonExistentId}`
      );
      expect(res.status).toBe(404);
    });
  });

  describe("GET /listing/search/bounds", () => {
    it("validates that all bounds params are present", async () => {
      const res = await request(app.callback())
        .get(`/listing/search/bounds`)
        .query({ bounds_north: 47.69011227856514 });
      expect(res.status).toBe(400);
    });

    it("Only returns listings that are inside the bounds", async () => {
      const res = await request(app.callback())
        .get("/listing/search/bounds")
        .query(FremontViewportBounds);
      const data: ListingSearchResponse = res.body;
      const foundListingPlaceIds = data.listings.map((l) => l.placeId);
      expect(foundListingPlaceIds).toContain(InsideBoundsPlaceId);
      expect(foundListingPlaceIds).not.toContain(OutsideBoundsPlaceId);
    });
  });
});
