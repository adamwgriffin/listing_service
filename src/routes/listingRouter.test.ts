import request from 'supertest'
import app from '../app'
import Listing from '../models/listingModel'

describe('listingRouter', () => {

  describe('POST /listing', () => {
    let createdListingId

    afterEach(async () => {
      // Destroy the created listing after each test runs
      await Listing.deleteOne({ _id: createdListingId })
    })

    it('creates a new listing', async () => {
      const res = await request(app.callback())
        .post('/listing')
        .send({ listPrice: 100000 })
      expect(res.status).toBe(201)
      expect(res.body.listPrice).toBe(100000)
      // Save the created listing's ID in order to destroy it after the test runs
      createdListingId = res.body._id
    })
  })

  describe('GET /listing/:id', () => {
    let listing

    beforeAll(async () => {
      listing = await Listing.create({ listPrice: 100000 })
    })

    afterAll(async () => {
      await Listing.deleteOne({ _id: listing._id })
    })

    it('returns a listing', async () => {
      const listing = await Listing.create({ listPrice: 100000 })
      const res = await request(app.callback())
        .get(`/listing/${listing._id}`)
      expect(res.status).toBe(200)
      expect(res.body.listPrice).toBe(100000)
      expect(res.body._id).toBe(listing._id.toString())
    })
  })

  describe('PUT /listing/:id', () => {
    let listing

    beforeAll(async () => {
      listing = await Listing.create({ listPrice: 100000 })
    })

    afterAll(async () => {
      await Listing.deleteOne({ _id: listing._id })
    })

    it('updates a listing', async () => {
      const res = await request(app.callback())
        .put(`/listing/${listing._id}`)
        .send({ listPrice: 200000 })
      expect(res.status).toBe(200)
      expect(res.body.listPrice).toBe(200000)
      expect(res.body._id).toBe(listing._id.toString())
    })
  })

  describe('DELETE /listing/:id', () => {
    let listing

    beforeAll(async () => {
      listing = await Listing.create({ listPrice: 100000 })
    })

    it('deletes a listing', async () => {
      const res = await request(app.callback())
        .delete(`/listing/${listing._id}`)
      expect(res.status).toBe(204)
      const deletedListing = await Listing.findById(listing._id)
      expect(deletedListing).toBeNull()
    })
  })

})
