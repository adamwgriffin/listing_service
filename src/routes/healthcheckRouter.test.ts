import request from 'supertest'
import app from '../app'

describe('healthcheckController', () => {
  describe('GET /ping', () => {
    it('should return status 200 and message "pong"', async () => {
      const response = await request(app.callback()).get('/ping')
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: 'pong' })
    })
  })
})
