import request from "supertest";
import { buildApp } from "../../../../app";
import BoundaryModel from "../../../../models/BoundaryModel";
import type { BoundarySearchResponse } from "../../../../types/listing_search_response_types";
import { getNonExistingBoundaryId } from "../../../testHelpers";

const app = buildApp();

describe("GET /listing/search/boundary/:id", () => {
  it("validates the boundary ID params type", async () => {
    const res = await request(app.callback()).get(
      `/listing/search/boundary/bad_id_type`
    );
    expect(res.status).toBe(400);
  });

  it("returns listings that are inside the given boundary", async () => {
    const boundary = await BoundaryModel.findOne().lean();
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
    const res = await request(app.callback()).get(
      `/listing/search/boundary/${getNonExistingBoundaryId()}`
    );
    expect(res.status).toBe(404);
  });
});
