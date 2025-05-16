import request from "supertest";
import { buildApp } from "../../app";
import Boundary from "../../models/BoundaryModel";
import { boundsParamsToGeoJSONPolygon } from "../../services/listingSearchService";
import type { BoundarySearchResponse } from "../../types/listing_search_response_types";
import { listingsInsideBoundary } from "../test_helpers";

const FremontViewportBounds = {
  bounds_north: 47.69011227856514,
  bounds_east: -122.32789118536581,
  bounds_south: 47.62356960805306,
  bounds_west: -122.38144953497519
};
const FremontPlaceId = "ChIJ1WmlZawVkFQRmE1TlcKlxaI";
const FremontLocationString = "Fremont, Seattle, WA";
const AddressWithNoData = "851 NW 85th Street, Seattle, WA 98117";
const StreetAddressPlaceId = "ChIJsa_uptMVkFQRmZ6RBFqLu4s";

const app = buildApp();

describe("listingSearchRouter", () => {
  describe("GET /listing/search/boundary/:id", () => {
    it("validates the boundary ID params type", async () => {
      const res = await request(app.callback()).get(
        `/listing/search/boundary/bad_id_type`
      );
      expect(res.status).toBe(400);
    });

    it("returns listings that are inside the given boundary", async () => {
      const boundary = await Boundary.findOne().lean();
      if (!boundary) throw new Error("No boundaries found in test database");
      const res = await request(app.callback()).get(
        `/listing/search/boundary/${boundary._id}`
      );
      expect(res.status).toBe(200);
      const data: BoundarySearchResponse = res.body;
      expect(data.boundary.placeId).toEqual(boundary.placeId);
      expect(data.listings.length).toBeGreaterThan(0);
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

    it("only returns listings that are inside the bounds", async () => {
      const res = await request(app.callback())
        .get("/listing/search/bounds")
        .query(FremontViewportBounds);
      const geoJSONPolygon = boundsParamsToGeoJSONPolygon(
        FremontViewportBounds
      );
      expect(listingsInsideBoundary(geoJSONPolygon, res.body.listings)).toBe(
        true
      );
    });
  });

  describe("GET /listing/search/geocode", () => {
    it("validates that either a place_id or address param are present in the request", async () => {
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
  });
});
