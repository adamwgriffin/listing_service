import request from "supertest";
import { buildApp } from "../../../../app";
import { testFilters } from "../../../testFilters";
import { listingsInsideBoundary } from "../../../testHelpers";

const FremontPlaceId = "ChIJ1WmlZawVkFQRmE1TlcKlxaI";
const FremontLocationString = "Fremont, Seattle, WA";
const AddressWithNoData = "851 NW 85th Street, Seattle, WA 98117";
const StreetAddressPlaceId = "ChIJsa_uptMVkFQRmZ6RBFqLu4s";

describe("GET /listing/search/geocode", () => {
  const app = buildApp();

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
        place_id: FremontPlaceId,
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
          place_id: FremontPlaceId,
          address_types: "neighborhood,political"
        });
      expect(res.body.boundary.placeId).toEqual(FremontPlaceId);
    });

    it("finds the listing that matches the place_id for street address types", async () => {
      const res = await request(app.callback())
        .get(`/listing/search/geocode`)
        .query({
          place_id: StreetAddressPlaceId,
          address_types: "street_address"
        });
      expect(res.body.listingDetail.placeId).toEqual(StreetAddressPlaceId);
    });
  });

  describe("when the request includes the address param", () => {
    it("geocodes and finds a boundary for boundary address types", async () => {
      const res = await request(app.callback())
        .get(`/listing/search/geocode`)
        .query({
          address: FremontLocationString
        });
      expect(res.body.boundary.placeId).toEqual(FremontPlaceId);
    });

    it("geocodes and finds a listing for street address types", async () => {
      const res = await request(app.callback())
        .get(`/listing/search/geocode`)
        .query({
          address: "5902 8th Avenue Northwest, Seattle, WA 98107, USA"
        });
      expect(res.body.listingDetail.placeId).toEqual(
        "ChIJsa_uptMVkFQRmZ6RBFqLu4s"
      );
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

  testFilters(app, "/listing/search/geocode", {
    place_id: FremontPlaceId,
    address_types: "neighborhood,political"
  });
});
