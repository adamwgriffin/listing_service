import { z } from "zod";
import { BoundaryTypes } from "../models/BoundaryModel";
import { multiPolygonSchema } from "./geojsonSchema";

export const zBoundarySchema = z.object({
  name: z.string().min(1),
  type: z.enum(BoundaryTypes),
  geometry: multiPolygonSchema,
  placeId: z.string().min(1)
});
