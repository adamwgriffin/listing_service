import type { HydratedDocument } from 'mongoose'
import request from 'supertest'
import { buildApp } from '../../app'
import type { ListingData } from '../../lib/random_data'
import Listing, { IListing } from '../../models/ListingModel'

const app = buildApp()

const listingData: ListingData = {
  listPrice: 700000,
  listedDate: new Date,
  address: {
    line1: '123 Test St',
    city: 'Test',
    state: 'WA',
    zip: '12345'
  },
  geometry: {
    type: 'Point',
    coordinates: [-122.3507218, 47.6610594]
  },
  beds: 2,
  baths: 1,
  sqft: 2345,
  lotSize: 234312,
  yearBuilt: 1984,
  neighborhood: "Test Hills",
  propertyType: 'single-family',
  status: 'active'
}

describe('listingRouter', () => {
  describe('GET /listing/:id', () => {
    let listing: HydratedDocument<IListing>

    beforeAll(async () => {
      listing = await Listing.create(listingData)
    })

    afterAll(async () => {
      await Listing.deleteOne({ _id: listing._id })
    })

    it('returns a listing', async () => {
      const res = await request(app.callback()).get(`/listing/${listing._id}`)
      expect(res.status).toBe(200)
      expect(res.body.listPrice).toBe(700000)
      expect(res.body._id).toBe(listing._id.toString())
    })
  })
})
