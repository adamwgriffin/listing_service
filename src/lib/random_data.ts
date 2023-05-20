import type { IListing } from '../models/listingModel'
import type { Point, Polygon, MultiPolygon } from '@turf/turf'
import type { AddressComponentAddress } from '../lib/geocoder'
import { bbox, randomPoint, booleanPointInPolygon } from '@turf/turf'
import { faker } from '@faker-js/faker'
import { reverseGeocode, addressComponentsToAddress } from '../lib/geocoder'
import { PropertyTypes, PropertyStatuses } from '../models/listingModel'

export const randomPointsWithinPolygon = (
  polygon: Polygon | MultiPolygon,
  numPoints: number
) => {
  const points: Point[] = []
  const bounds = bbox(polygon)
  while (points.length < numPoints) {
    const point = randomPoint(1, { bbox: bounds }).features[0]
    if (booleanPointInPolygon(point, polygon)) {
      points.push(point.geometry)
    }
  }
  return points
}

export const randomNumberInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const monthsAgo = (months = 6) => {
  const today = new Date()
  return new Date(
    today.getFullYear(),
    today.getMonth() - months,
    today.getDate()
  )
}

export const createRandomListingModel = (
  address: AddressComponentAddress,
  point: Point
): IListing => {
  const today = new Date()
  return {
    listPrice: randomNumberInRange(100000, 800000),
    listedDate: faker.date.between({
      from: monthsAgo(6),
      to: today
    }),
    address: {
      line1: [address?.streetNumber, address?.streetAddress].join(' ').trim(),
      line2: '',
      city: address.city,
      state: address.state,
      zip: address.postalCode
    },
    geometry: point,
    neighborhood: address?.neighborhood,
    propertyType: faker.helpers.arrayElement(PropertyTypes),
    status: faker.helpers.arrayElement(PropertyStatuses),
    description: faker.lorem.sentences({ min: 1, max: 3 }),
    beds: randomNumberInRange(2, 5),
    baths: randomNumberInRange(1, 4),
    sqft: randomNumberInRange(1000, 5000),
    lotSize: randomNumberInRange(1000, 7500),
    yearBuilt: randomNumberInRange(1910, today.getFullYear())
  }
}

export const createListing = async (point: Point): Promise<IListing> => {
  const res = await reverseGeocode(point.coordinates[1], point.coordinates[0])
  if (!res.data.results[0]?.address_components) {
    console.warn(
      `No address_components found for reverseGeocode of ${point.coordinates}. No model created.`
    )
    return
  }
  const address = addressComponentsToAddress(
    res.data.results[0].address_components
  )
  if (address.neighborhood == '') {
    console.warn(
      `No neighborhood found for reverseGeocode of ${point.coordinates}. No model created.`
    )
    return
  }
  return createRandomListingModel(address, point)
}

const generateListingData = async (
  polygon: Polygon | MultiPolygon,
  amount: number
) => {
  const points = randomPointsWithinPolygon(polygon, amount)
  const listings = await Promise.all(
    points.map(async (point) => await createListing(point))
  )
  return listings.filter(Boolean)
}

export default generateListingData
