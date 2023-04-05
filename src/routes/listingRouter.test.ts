import request from 'supertest'
import app from '../app'

describe('listingRouter', () => {

  describe('POST /listing/create', () => {
    it('creates a new listing', async () => {
      const response = await request(app.callback())
        .post('/listing/create')
        .send({ listPrice: 100 })
      expect(response.status).toBe(201)
      expect(response.body.listing.listPrice).toBe(100)
    })
  })
})
