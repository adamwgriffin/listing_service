import request from 'supertest'
import app from '../app'

describe('listingRouter', () => {

  describe('POST /listing/create', () => {
    it('creates a new listing', async () => {
      const res = await request(app.callback())
        .post('/listing/create')
        .send({ listPrice: 100000 })
      expect(res.status).toBe(201)
      expect(res.body.listPrice).toBe(100000)
    })
  })
})
