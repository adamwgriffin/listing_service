import type { MultiPolygon } from "geojson";
import mongoose, { Model, Schema } from "mongoose";
import MultiPolygonSchema from "./MultiPolygonSchema";

export const BoundaryTypes = [
  "neighborhood",
  "city",
  "zip_code",
  "county",
  "state",
  "country",
  "school_district",
  "school"
] as const;

export type BoundaryType = (typeof BoundaryTypes)[number];

export interface IBoundary {
  name: string;
  type: BoundaryType;
  geometry: MultiPolygon;
  placeId: string;
}

// Making placeId a required field because we don't really want to have to guess
// if a boundary matches a given request or not by just searching via
// `$geoIntersects`. If we were unable to geocode a boundary, or manually, map
// it to a specific string, then we just shouldn't use it at all.
export const BoundarySchema: Schema<IBoundary> = new Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: BoundaryTypes,
    required: true
  },
  geometry: {
    type: MultiPolygonSchema,
    // NOTE: It's very important that this index gets defined here, rather than
    // on the coordinates in the MultiPolygonSchema. putting them on the
    // coordinates breaks things so that you can never create a record
    // successfully
    index: "2dsphere",
    required: true
  },
  placeId: {
    type: String,
    index: true,
    required: true
  }
});

export default (mongoose.models.Boundary as Model<IBoundary>) ||
  mongoose.model<IBoundary, Model<IBoundary>>("Boundary", BoundarySchema);
