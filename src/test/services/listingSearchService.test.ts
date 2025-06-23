import { booleanPointInPolygon } from "@turf/turf";
import { z } from "zod";
import {
  type PlaceIdLookupContext,
  boundsParamsToGeoJSONPolygon,
  getBoundaryGeometryWithBounds,
  getResultsForPlaceId,
  getResultsForPlaceIdRequest
} from "../../services/listingSearchService";
import { zBoundarySchema } from "../../zod_schemas/zBoundarySchema";
import { polygonSchema } from "../../zod_schemas/geojsonSchema";
import fremontBoundary from "../data/fremontBoundary";
import {
  BoundsExcludingPartOfFremontBoundary,
  ViewportBoundsExcludingFremontBoundary
} from "../testHelpers";

const { insideBoundsPoint, outsideBoundsPoint, boundsParams, boundsPoly } =
  BoundsExcludingPartOfFremontBoundary;

const mockPlaceIdLookupContext: PlaceIdLookupContext = {
  query: {},
  db: {
    listing: {
      findWithinBounds() {
        return new Promise((resolve) => {
          resolve([]);
        });
      }
    },
    boundary: {
      findByPlaceId() {
        return new Promise((resolve) => {
          resolve(null);
        });
      }
    }
  }
};

describe("listingSearchService", () => {
  describe("boundsParamsToGeoJSONPolygon", () => {
    it("converts bounds params to a GeoJSON Polygon", () => {
      const polygon = boundsParamsToGeoJSONPolygon({
        bounds_north: 47.69011227856514,
        bounds_east: -122.32789118536581,
        bounds_south: 47.62356960805306,
        bounds_west: -122.38144953497519
      });
      expect(polygonSchema.safeParse(polygon).success).toBe(true);
    });
  });

  describe("getBoundaryGeometryWithBounds", () => {
    it("just returns the given boundary geometry if there are no bounds params in the query", () => {
      const boundary = getBoundaryGeometryWithBounds(fremontBoundary, {});
      expect(boundary).toEqual(fremontBoundary.geometry);
    });

    it("returns the intersection of the bounds and boundary if they intersect", () => {
      const intersectionBoundary = getBoundaryGeometryWithBounds(
        fremontBoundary,
        boundsParams
      );
      expect(intersectionBoundary).not.toBeNull();
      expect(intersectionBoundary).not.toEqual(fremontBoundary.geometry);
    });

    it("returns null if the bounds and boundary do not intersect", () => {
      const intersectionBoundary = getBoundaryGeometryWithBounds(
        fremontBoundary,
        ViewportBoundsExcludingFremontBoundary
      );
      expect(intersectionBoundary).toBeNull();
    });

    it("excludes parts of the boundary that are outside of the bounds params", () => {
      expect(
        booleanPointInPolygon(outsideBoundsPoint.coordinates, boundsPoly)
      ).toBe(false);

      expect(
        booleanPointInPolygon(insideBoundsPoint.coordinates, boundsPoly)
      ).toBe(true);

      const intersectionBoundary = getBoundaryGeometryWithBounds(
        fremontBoundary,
        boundsParams
      );

      if (intersectionBoundary === null) {
        throw new Error("The intersectionBoundary should not be null");
      }

      expect(
        booleanPointInPolygon(
          outsideBoundsPoint.coordinates,
          intersectionBoundary
        )
      ).toBe(false);

      expect(
        booleanPointInPolygon(
          insideBoundsPoint.coordinates,
          intersectionBoundary
        )
      ).toBe(true);
    });
  });

  describe("getResultsForPlaceId", () => {
    it("returns nothing if no boundary was found for the place_id", async () => {
      const result = await getResultsForPlaceId(
        "fake_place_id",
        mockPlaceIdLookupContext
      );
      expect(result).toBeUndefined();
    });

    it("returns the boundary and the listing results if a boundary was found", async () => {
      const ctx = { ...mockPlaceIdLookupContext };
      ctx.db.boundary = {
        findByPlaceId() {
          return new Promise((resolve) => {
            resolve(fremontBoundary);
          });
        }
      };
      const result = await getResultsForPlaceId(fremontBoundary.placeId, ctx);
      const validResult = z
        .object({
          boundary: zBoundarySchema,
          results: z.array(z.any())
        })
        .safeParse(result).success;
      expect(validResult).toBe(true);
    });
  });

  describe("getResultsForPlaceIdRequest", () => {
    describe("when either place_id or address_types are missing in the query", () => {
      it("returns nothing", async () => {
        const ctx = { ...mockPlaceIdLookupContext };
        ctx.query = { place_id: fremontBoundary.placeId };
        expect(await getResultsForPlaceIdRequest(ctx)).toBeUndefined();
        ctx.query = { address_types: "neighborhood,political" };
        expect(await getResultsForPlaceIdRequest(ctx)).toBeUndefined();
      });
    });

    describe("when the address_types are for a listing address rather than a boundary", () => {
      it("returns nothing", async () => {
        const ctx = {
          ...mockPlaceIdLookupContext,
          query: { address_types: "street_address" }
        };
        expect(await getResultsForPlaceIdRequest(ctx)).toBeUndefined();
      });
    });

    describe("when a place_id boundary and address_types are included in the query", () => {
      it("returns the boundary and the listing results if a boundary was found", async () => {
        const ctx = { ...mockPlaceIdLookupContext };
        ctx.db.boundary = {
          findByPlaceId() {
            return new Promise((resolve) => {
              resolve(fremontBoundary);
            });
          }
        };
        ctx.query = {
          place_id: fremontBoundary.placeId,
          address_types: "neighborhood,political"
        };
        const result = await getResultsForPlaceIdRequest(ctx);
        const validResult = z
          .object({
            boundary: zBoundarySchema,
            results: z.array(z.any())
          })
          .safeParse(result).success;
        expect(validResult).toBe(true);
      });
    });
  });
});
