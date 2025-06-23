import { z } from "zod";
import { BoundaryTypes } from "../models/BoundaryModel";

const multiPolygonSchema = z.object({
  type: z.literal("MultiPolygon"),
  coordinates: z.array(
    z.array(
      z.array(
        z.tuple([z.number(), z.number()]) // [longitude, latitude]
      )
    )
  )
});

export const zBoundarySchema = z.object({
  name: z.string().min(1),
  type: z.enum(BoundaryTypes),
  geometry: multiPolygonSchema,
  placeId: z.string().min(1)
});
