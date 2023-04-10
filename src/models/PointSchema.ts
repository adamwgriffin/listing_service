import { Schema } from 'mongoose'

// Note that longitude comes first in a GeoJSON coordinate array, not latitude.
export interface IPoint {
  type: 'Point'
  coordinates: [number, number]
}

const PointSchema = new Schema<IPoint>({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    index: '2dsphere',
    required: true
  }
})

export default PointSchema
