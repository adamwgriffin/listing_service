import request from "supertest";
import { buildApp } from "../../../../app";
import { boundsParamsToGeoJSONPolygon } from "../../../../services/listingSearchService";
import { testFilters } from "../../../testFilters";
import { listingsInsideBoundary } from "../../../testHelpers";

const FremontViewportBounds = {
  bounds_north: 47.69011227856514,
  bounds_east: -122.32789118536581,
  bounds_south: 47.62356960805306,
  bounds_west: -122.38144953497519
};

describe("GET /listing/search/bounds", () => {
  const app = buildApp();

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
    const geoJSONPolygon = boundsParamsToGeoJSONPolygon(FremontViewportBounds);
    expect(listingsInsideBoundary(geoJSONPolygon, res.body.listings)).toBe(
      true
    );
  });

  testFilters(app, "/listing/search/bounds", FremontViewportBounds);
});
