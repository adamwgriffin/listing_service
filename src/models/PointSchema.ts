import type { Point } from "geojson";
import { Schema } from "mongoose";

// The coordinates array puts the lat/lng backwards, e.g., coordinates:
// [longitude, latitude]
const PointSchema = new Schema<Point>({
  type: {
    type: String,
    enum: ["Point"],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

export default PointSchema;
