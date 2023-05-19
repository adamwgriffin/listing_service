import type { IListing } from '../models/listingModel'
import type { Point, Polygon, MultiPolygon } from '@turf/turf'
import type { IBoundary } from '../models/BoundaryModel'
import type { AddressComponentAddress } from '../lib/geocoder'
import type { PropertyType } from '../models/listingModel'
import { bbox, randomPoint, booleanPointInPolygon } from '@turf/turf'
import fs from 'fs'
import path from 'path'
import { faker } from '@faker-js/faker'
import boundary from '../test/test_data/boundary_data/fremont_boundary'
import { reverseGeocode, addressComponentsToAddress } from '../lib/geocoder'
import { PropertyTypes } from '../models/listingModel'

const randomPointsWithinPolygon = (
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

const randomNumberInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const monthsAgo = (months = 6) => {
  const today = new Date()
  return new Date(
    today.getFullYear(),
    today.getMonth() - months,
    today.getDate()
  )
}

const createListingModel = (address: AddressComponentAddress, point: Point): IListing => {
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
    description: faker.lorem.sentences({ min: 1, max: 3 }),
    beds: randomNumberInRange(2, 5),
    baths: randomNumberInRange(1, 4),
    sqft: randomNumberInRange(1000, 5000),
    lotSize: randomNumberInRange(1000, 7500),
    yearBuilt: randomNumberInRange(1910, today.getFullYear())
  }
}

const createListing = async (point: Point): Promise<IListing> => {
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
  return createListingModel(address, point)
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

const main = async () => {
  const listings = await generateListingData(
    (boundary as IBoundary).geometry,
    48
  )

  const outputPath = path.join(
    __dirname,
    '..',
    'test',
    'test_data',
    'listing_data',
    'random_listing_data.json'
  )

  fs.writeFileSync(outputPath, JSON.stringify(listings, null, 2))

  console.log(`Random listing data saved to "${outputPath}".`)
}

main()
