import { z } from "zod";

export const polygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(
    z.array(
      z.tuple([z.number(), z.number()]) // [longitude, latitude]
    )
  )
});

export const multiPolygonSchema = z.object({
  type: z.literal("MultiPolygon"),
  coordinates: z.array(
    z.array(
      z.array(
        z.tuple([z.number(), z.number()]) // [longitude, latitude]
      )
    )
  )
});
