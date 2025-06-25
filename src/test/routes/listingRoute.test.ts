import request from "supertest";
import app from "../../app";
import { type ListingQueryResult } from "../../respositories/ListingRepository";
import listingTemplate from "../data/listingTemplate";

describe("GET /listing/:slug", () => {
  let listing: ListingQueryResult;

  beforeAll(async () => {
    listing = await app.context.db.listing.createListingWithRetry(listingTemplate, 0);
  });

  afterAll(async () => {
    await app.context.db.listing.deleteListingsById([listing._id]);
  });

  it("returns the listing with the given slug", async () => {
    const res = await request(app.callback()).get(`/listing/${listing.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.slug).toBe(listing.slug);
  });

  it("returns a not found status when a listing with the given slug does not exist", async () => {
    const nonExistentSlug = "";
    const listing = await app.context.db.listing.findBySlug(nonExistentSlug);
    expect(listing).toBeNull();
    const res = await request(app.callback()).get(
      `/listing/${nonExistentSlug}`
    );
    expect(res.status).toBe(404);
  });
});
