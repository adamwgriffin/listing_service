import type { IListing } from '../models/listingModel'
import type { Point, Polygon, MultiPolygon } from '@turf/turf'
import type { IBoundary } from '../models/BoundaryModel'
import type { AddressComponentAddress } from '../lib/geocoder'
import { bbox, randomPoint, booleanPointInPolygon } from '@turf/turf'
import fs from 'fs'
import path from 'path'
import boundary from '../test/test_data/boundary_data/fremont_boundary'
import { reverseGeocode, addressComponentsToAddress } from '../lib/geocoder'

const generateRandomPointsInPolygon = (
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

const generateRandomNumberInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const generateLoremIpsumText = async (
  numSentences: number
): Promise<string> => {
  const response = await fetch(
    `https://loripsum.net/api/${numSentences}/plaintext`
  )
  return await response.text()
}

const createListingModel = (
  address: AddressComponentAddress,
  description: string,
  point: Point
) => {
  return {
    listPrice: generateRandomNumberInRange(100000, 800000),
    beds: generateRandomNumberInRange(2, 4),
    baths: generateRandomNumberInRange(1, 4),
    sqft: generateRandomNumberInRange(1000, 2000),
    address: {
      line1: [address?.streetNumber, address?.streetAddress].join(' ').trim(),
      line2: '',
      city: address.city,
      state: address.state,
      zip: address.postalCode
    },
    neighborhood: address?.neighborhood,
    description,
    geometry: point
  }
}

const createListing = async (point: Point): Promise<Partial<IListing>> => {
  const description = await generateLoremIpsumText(
    generateRandomNumberInRange(1, 2)
  )
  const res = await reverseGeocode(point.coordinates[1], point.coordinates[0])
  if (res.data.results[0]?.address_components) {
    const address = addressComponentsToAddress(
      res.data.results[0].address_components
    )
    return createListingModel(address, description, point)
  } else {
    console.log(
      `No address_components found for reverseGeocode of ${point.coordinates}. No model created.`
    )
    return
  }
}

const generateListingData = async (
  polygon: Polygon | MultiPolygon,
  amount: number
) => {
  const points = generateRandomPointsInPolygon(polygon, amount)
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
