import { Polygon } from '@turf/turf'
import { Schema } from 'mongoose'

const PolygonSchema = new Schema<Polygon>({
  type: {
    type: String,
    enum: ['Polygon'],
    required: true
  },
  coordinates: {
    type: [[[Number]]],
    required: true
  }
})

export default PolygonSchema
