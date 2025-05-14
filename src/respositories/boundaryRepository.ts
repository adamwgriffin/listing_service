import BoundaryModel, {
  type BoundaryType,
  type IBoundary
} from '../models/BoundaryModel'

export type IBoundaryRepository = {
  findBoundaries: (
    lat: number,
    lng: number,
    boundaryType: BoundaryType
  ) => Promise<IBoundary[]>

  findByPlaceId: (placeId: string) => Promise<IBoundary | null>

  findById: (id: string) => Promise<IBoundary | null>
}

const findBoundaries = async (
  lat: number,
  lng: number,
  boundaryType: BoundaryType
) => {
  return BoundaryModel.find({
    $and: [
      {
        geometry: {
          $geoIntersects: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            }
          }
        }
      },
      {
        type: boundaryType
      }
    ]
  }).lean()
}

const findByPlaceId = async (placeId: string) => {
  return BoundaryModel.findOne({ placeId }).lean()
}

const findById = async (id: string) => {
  return BoundaryModel.findById(id).lean()
}

export const BoundaryRepository: IBoundaryRepository = {
  findBoundaries,
  findByPlaceId,
  findById
}
