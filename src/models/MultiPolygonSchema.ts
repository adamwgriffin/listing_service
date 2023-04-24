import { Schema } from 'mongoose'

export interface IMultiPolygon {
  type: 'MultiPolygon'
  coordinates: [[[[number, number]]]]
}

const MultiPolygonSchema = new Schema<IMultiPolygon>({
  type: {
    type: String,
    enum: ['MultiPolygon'],
    required: true
  },
  coordinates: {
    type: [[[[Number]]]],
    required: true
  }
})

export default MultiPolygonSchema
