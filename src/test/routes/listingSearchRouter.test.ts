import request from 'supertest'
import app from '../../app'
import Boundary from '../../models/BoundaryModel'

describe('listingSearchRouter', () => {
  describe('GET /listing/search/boundary/:id', () => {
    it('returns a successful status when a boundary with the given ID exists', async () => {
      const boundary = await Boundary.findOne().lean()
      const res = await request(app.callback()).get(`/listing/search/boundary/${boundary?._id}`)
      expect(res.status).toBe(200)
    })

    it('validates the boundary ID params type', async () => {
      const res = await request(app.callback()).get(`/listing/search/boundary/bad_id_type`)
      expect(res.status).toBe(400)
    })

    it('returns a not found status when a boundary with the given ID does not exist', async () => {
      const nonExistentId = new Boundary()._id.toString()
      const res = await request(app.callback()).get(`/listing/search/boundary/${nonExistentId}`)
      expect(res.status).toBe(404)
    })
  })
})
