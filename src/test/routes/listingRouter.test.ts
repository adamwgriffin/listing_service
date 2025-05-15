import request from "supertest";
import { buildApp } from "../../app";
import Listing from "../../models/ListingModel";

const app = buildApp();

describe("listingRouter", () => {
  describe("GET /listing/:id", () => {
    it("validates the listing ID param type", async () => {
      const res = await request(app.callback()).get("/listing/invalid_type");
      expect(res.status).toBe(400);
    });

    it("returns a listing", async () => {
      const listingId = (await Listing.findOne().lean())?._id.toString();
      if (!listingId) throw new Error("No listings found in test database");
      const res = await request(app.callback()).get(`/listing/${listingId}`);
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(listingId);
    });

    it("returns a not found status when a listing with the given ID does not exist", async () => {
      const nonExistentId = new Listing()._id;
      const res = await request(app.callback()).get(
        `/listing/${nonExistentId}`
      );
      expect(res.status).toBe(404);
    });
  });
});
