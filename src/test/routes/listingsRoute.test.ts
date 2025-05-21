import request from "supertest";
import { buildApp } from "../../app";
import type { ListingsResponse } from "../../types/listing_search_response_types";
import { getNonExistingListingId } from "../testHelpers";
import listingTemplate from "../data/listingTemplate";
import ListingModel from "../../models/ListingModel";

describe("GET /listings/:ids", () => {
  const app = buildApp();

  let listingIds: string[];

  beforeAll(async () => {
    const listings = await ListingModel.create([
      listingTemplate,
      listingTemplate
    ]);
    listingIds = listings.map((l) => l._id.toString());
  });

  afterAll(async () => {
    await ListingModel.deleteMany({ _id: { $in: listingIds } });
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
