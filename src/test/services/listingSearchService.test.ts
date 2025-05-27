import { ViewportBoundsExcludingFremontBoundary } from "../testHelpers";
import fremontBoundary from "../data/fremontBoundary";
import { getBoundaryGeometryWithBounds } from "../../services/listingSearchService";
import { booleanPointInPolygon } from "@turf/turf";
import { BoundsExcludingPartOfFremontBoundary } from "../testHelpers";

const { insideBoundsPoint, outsideBoundsPoint, boundsParams, boundsPoly } =
  BoundsExcludingPartOfFremontBoundary;

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
});
