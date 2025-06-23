import { booleanPointInPolygon } from "@turf/turf";
import {
  type PlaceIdLookupContext,
  getBoundaryGeometryWithBounds,
  getResultsForPlaceId
} from "../../services/listingSearchService";
import fremontBoundary from "../data/fremontBoundary";
import {
  BoundsExcludingPartOfFremontBoundary,
  ViewportBoundsExcludingFremontBoundary
} from "../testHelpers";
import { z } from "zod";
import { zBoundarySchema } from "../../zod_schemas/zBoundarySchema";

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
});
