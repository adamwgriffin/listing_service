import { type HydratedDocument } from "mongoose";
import request from "supertest";
import { buildApp } from "../../app";
import BoundaryModel, {
  type IBoundary
} from "../../models/BoundaryModel";
import ListingModel, { type IListing } from "../../models/ListingModel";
import type { BoundarySearchResponse } from "../../types/listing_search_response_types";
import fremontBoundary from "../data/fremontBoundary";
import listingTemplate from "../data/listingTemplate";
import { getNonExistingBoundaryId } from "../testHelpers";

describe("GET /listing/search/boundary/:id", () => {
  const app = buildApp();

  let boundary: HydratedDocument<IBoundary>;
  let listing: HydratedDocument<IListing>;

  beforeAll(async () => {
    boundary = await BoundaryModel.create(fremontBoundary);
    listing = await app.context.db.listing.createListing(listingTemplate);
  });

  afterAll(async () => {
    await BoundaryModel.deleteOne({ _id: boundary._id });
    await ListingModel.deleteOne({ _id: listing._id });
  });

  it("validates the boundary ID params type", async () => {
    const res = await request(app.callback()).get(
      `/listing/search/boundary/bad_id_type`
    );
    expect(res.status).toBe(400);
  });

  it("returns listings that are inside the given boundary", async () => {
    const res = await request(app.callback()).get(
      `/listing/search/boundary/${boundary._id}`
    );
    expect(res.status).toBe(200);
    const data: BoundarySearchResponse = res.body;
    expect(data.boundary.placeId).toEqual(boundary.placeId);
    expect(data.listings.length).toBeGreaterThan(0);
  });

  it("returns a not found status when a boundary with the given ID does not exist", async () => {
    const res = await request(app.callback()).get(
      `/listing/search/boundary/${getNonExistingBoundaryId()}`
    );
    expect(res.status).toBe(404);
  });
});
