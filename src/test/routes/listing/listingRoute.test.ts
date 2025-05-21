import request from "supertest";
import { buildApp } from "../../../app";
import ListingModel from "../../../models/ListingModel";
import listingTemplate from "../../data/listingTemplate";
import { getNonExistingListingId } from "../../testHelpers";

describe("GET /listing/:id", () => {
  const app = buildApp();

  let listingId: string;

  beforeAll(async () => {
    listingId = (await ListingModel.create(listingTemplate))._id.toString();
  });

  afterAll(async () => {
    await ListingModel.deleteOne({ _id: listingId });
  });

  it("validates the listing ID param type", async () => {
    const res = await request(app.callback()).get("/listing/invalid_type");
    expect(res.status).toBe(400);
  });

  it("returns the listing with the given ID", async () => {
    const res = await request(app.callback()).get(`/listing/${listingId}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(listingId);
  });

  it("returns a not found status when a listing with the given ID does not exist", async () => {
    const res = await request(app.callback()).get(
      `/listing/${getNonExistingListingId()}`
    );
    expect(res.status).toBe(404);
  });
});
