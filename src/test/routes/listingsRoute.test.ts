import request from "supertest";
import app from "../../app";
import type { ListingsResponse } from "../../types/listing_search_response_types";
import listingTemplate from "../data/listingTemplate";
import { getNonExistingListingId } from "../testHelpers";

describe("GET /listings/:ids", () => {
  const listingIds: string[] = [];

  beforeAll(async () => {
    const listingOne =
      await app.context.db.listing.createListing(listingTemplate);
    const listingTwo =
      await app.context.db.listing.createListing(listingTemplate);
    listingIds.push(listingOne._id.toString());
    listingIds.push(listingTwo._id.toString());
  });

  afterAll(async () => {
    await app.context.db.listing.deleteListingsById(listingIds);
  });

  it("validates the listing IDs params type for all IDs in the request", async () => {
    const res = await request(app.callback()).get(
      `/listing/${listingIds.join(",")},invalid_type`
    );
    expect(res.status).toBe(400);
  });

  it("returns the listings with the given IDs", async () => {
    const res = await request(app.callback()).get(
      `/listings/${listingIds.join(",")}`
    );
    expect(res.status).toBe(200);
    const data: ListingsResponse = res.body;
    const responseIds = data.listings.map((l) => l._id.toString());
    expect(responseIds).toEqual(listingIds);
  });

  // This endpoint is mostly used to get a list of favorites that have been
  // saved for a user. It's reasonable to assume that some of these listings may
  // be deleted over time for various reasons, which is why we are not returning
  // an error for listings that were not found.
  describe("when not all the ids in the request were found", () => {
    it("returns only the listings that were found without any errors", async () => {
      const nonExistentId = getNonExistingListingId();
      const requestIds = [...listingIds, nonExistentId];
      const res = await request(app.callback()).get(
        `/listings/${requestIds.join(",")}`
      );
      expect(res.status).toBe(200);
      const data: ListingsResponse = res.body;
      const responseIds = data.listings.map((l) => l._id.toString());
      expect(responseIds).toEqual(listingIds);
    });
  });
});
