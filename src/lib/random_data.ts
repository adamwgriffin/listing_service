import type { IListing } from '../models/listingModel'
import type { Point, Polygon, MultiPolygon } from '@turf/turf'
import type { AddressComponentAddress } from '../lib/geocoder'
import { bbox, randomPoint, booleanPointInPolygon } from '@turf/turf'
import { faker } from '@faker-js/faker'
import { subMonths } from 'date-fns'
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

export const roundDownToNearest = (num: number, nearest: number): number => {
  return Math.floor(num / nearest) * nearest
}

export const addSoldData = (listing: IListing): IListing => {
  const today = new Date()
  const soldDate = faker.date.between({
    from: listing.listedDate,
    to: today
  })
  return {
    ...listing,
    soldPrice: randomPriceInRange(listing.listPrice - 5000, listing.listPrice + 5000),
    soldDate
  }
}

const randomPriceInRange = (min: number, max: number): number => {
  const price = randomNumberInRange(min, max)
  return roundDownToNearest(price, 1000)
}

export const createRandomListingModel = (
  address: AddressComponentAddress,
  point: Point
): IListing => {
  const today = new Date()
  const listing = {
    listPrice: randomPriceInRange(100000, 800000),
    listedDate: faker.date.between({
      from: subMonths(today, 6),
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
    sqft: roundDownToNearest(randomNumberInRange(1000, 5000), 100),
    lotSize: roundDownToNearest(randomNumberInRange(1000, 7500), 100),
    yearBuilt: randomNumberInRange(1910, today.getFullYear()),
    waterfront: faker.datatype.boolean({ probability: 0.3 }),
    view: faker.datatype.boolean({ probability: 0.5 }),
    fireplace: faker.datatype.boolean({ probability: 0.7 }),
    basement: faker.datatype.boolean({ probability: 0.8 }),
    garage: faker.datatype.boolean({ probability: 0.9 }),
    newConstruction: faker.datatype.boolean({ probability: 0.4 }),
    pool: faker.datatype.boolean({ probability: 0.2 }),
    airConditioning: faker.datatype.boolean({ probability: 0.3 }),
  }
  if (listing.status === 'sold') {
    return addSoldData(listing)
  }
  return listing
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
