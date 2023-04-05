import request from 'supertest'
import app from '../app'
import Listing from '../models/listingModel'

describe('listingRouter', () => {

  describe('POST /listing/create', () => {
    let createdListingId

    afterEach(async () => {
      // Destroy the created listing after each test runs
      await Listing.deleteOne({ _id: createdListingId })
    })

    it('creates a new listing', async () => {
      const res = await request(app.callback())
        .post('/listing/create')
        .send({ listPrice: 100000 })
      expect(res.status).toBe(201)
      expect(res.body.listPrice).toBe(100000)
      // Save the created listing's ID in order to destroy it after the test runs
      createdListingId = res.body._id
    })
  })
})
