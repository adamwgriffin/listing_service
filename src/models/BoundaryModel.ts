import type { MultiPolygon } from '@turf/turf'
import { Schema, model } from 'mongoose'
import MultiPolygonSchema from './MultiPolygonSchema'

export const BoundaryTypes = [
  'neighborhood',
  'city',
  'zip_code',
  'county',
  'state',
  'country',
  'school_district',
  'school'
] as const

export type BoundaryType = (typeof BoundaryTypes)[number]

export interface IBoundary {
  name: string
  type: BoundaryType
  geometry: MultiPolygon
}

export interface IBoundaryDocument extends IBoundary, Document {}

export const BoundarySchema = new Schema<IBoundaryDocument>({
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
    // NOTE: it's very important that this index gets defined here, rather than on the coordinates in the
    // MultiPolygonSchema. putting them on the coordinates breaks things so that you can never create a record
    // successfully
    index: '2dsphere',
    required: true
  }
})

const Boundary = model<IBoundaryDocument>('Boundary', BoundarySchema)

export default Boundary
