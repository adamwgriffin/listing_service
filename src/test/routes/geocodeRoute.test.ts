import { HydratedDocument } from "mongoose";
import request from "supertest";
import app from "../../app";
import BoundaryModel, { IBoundary } from "../../models/BoundaryModel";
import ListingModel, { IListing } from "../../models/ListingModel";
import fremontBoundary from "../data/fremontBoundary";
import geocodeListing from "../data/geocodeListing";
import { listingsInsideBoundary } from "../testHelpers";

const AddressWithNoData = "851 NW 85th Street, Seattle, WA 98117";

describe("GET /listing/search/geocode", () => {
  let boundary: HydratedDocument<IBoundary>;
  let listing: HydratedDocument<IListing>;

  beforeAll(async () => {
    boundary = await BoundaryModel.create(fremontBoundary);
    listing = await app.context.db.listing.createListing(geocodeListing);
  });

  afterAll(async () => {
    await BoundaryModel.deleteOne({ _id: boundary._id });
    await ListingModel.deleteOne({ _id: listing._id });
  });

  it("validates that either a place_id or address param is present in the request", async () => {
    const res = await request(app.callback())
      .get("/listing/search/geocode")
      .query({ price_min: 700000 });
    expect(res.status).toEqual(400);
  });

  it("finds listings inside the boundary", async () => {
    const res = await request(app.callback())
      .get(`/listing/search/geocode`)
      .query({
        place_id: fremontBoundary.placeId,
        address_types: "neighborhood,political"
      });
    expect(
      listingsInsideBoundary(res.body.boundary.geometry, res.body.listings)
    ).toBe(true);
  });

  describe("when the request includes place_id & address_types params", () => {
    it("finds the boundary that matches the place_id for boundary address types", async () => {
      const res = await request(app.callback())
        .get(`/listing/search/geocode`)
        .query({
          place_id: fremontBoundary.placeId,
          address_types: "neighborhood,political"
        });
      expect(res.body.boundary.placeId).toEqual(fremontBoundary.placeId);
    });

    it("finds the listing that matches the place_id for street address types", async () => {
      const res = await request(app.callback())
        .get(`/listing/search/geocode`)
        .query({
          place_id: listing.placeId,
          address_types: "street_address"
        });
      expect(res.body.listingDetail.placeId).toEqual(listing.placeId);
    });
  });

  describe("when the request includes the address param", () => {
    it("geocodes and finds a boundary for boundary address types", async () => {
      const res = await request(app.callback())
        .get(`/listing/search/geocode`)
        .query({
          address: fremontBoundary.name
        });
      expect(res.body.boundary.placeId).toEqual(fremontBoundary.placeId);
    });

    it("geocodes and finds a listing for street address types", async () => {
      const { line1, city, state, zip } = listing.address;
      const address = `${line1}, ${city}, ${state} ${zip}, USA`;
      const res = await request(app.callback())
        .get(`/listing/search/geocode`)
        .query({ address });
      expect(res.body.listingDetail.placeId).toEqual(listing.placeId);
    });
  });

  describe("when the locations was sucessfully geocoded, but no data is available", () => {
    it("returns the suggested viewport from the geocoded result", async () => {
      const res = await request(app.callback())
        .get(`/listing/search/geocode`)
        .query({
          address: AddressWithNoData
        });
      expect(res.body).toHaveProperty("viewport");
    });
  });
});
