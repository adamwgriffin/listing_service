import request from "supertest";
import { buildApp } from "../../app";
import type { ListingsResponse } from "../../types/listing_search_response_types";
import { getNonExistingListingId, getRandomListingIds } from "../testHelpers";

const app = buildApp();

describe("GET /listings/:ids", () => {
  it("validates the listing IDs params type for all IDs in the request", async () => {
    const res = await request(app.callback()).get(
      "/listing/682515e68bfc5a47dcde63d3,invalid_type"
    );
    expect(res.status).toBe(400);
  });

  it("returns the listings with the given IDs", async () => {
    const listingIds = await getRandomListingIds(2);
    const res = await request(app.callback()).get(
      `/listings/${listingIds.join(",")}`
    );
    expect(res.status).toBe(200);
    const data: ListingsResponse = res.body;
    const responseIds = data.listings.map((l) => l._id.toString());
    expect(responseIds).toEqual(listingIds);
  });

  describe("when no all the ids in the request were found", () => {
    it("returns only the listings that were found without any errors", async () => {
      const nonExistentId = getNonExistingListingId();
      const existingListingIds = await getRandomListingIds(1);
      const requestIds = [...existingListingIds, nonExistentId];
      const res = await request(app.callback()).get(
        `/listings/${requestIds.join(",")}`
      );
      expect(res.status).toBe(200);
      const data: ListingsResponse = res.body;
      const responseIds = data.listings.map((l) => l._id.toString());
      expect(responseIds).toEqual(existingListingIds);
    });
  });
});
