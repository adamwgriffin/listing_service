import request from 'supertest'
import app from '../app'

describe('diagnosticsController', () => {
  describe('GET /ping', () => {
    it('should return status 200 and message "pong"', async () => {
      const response = await request(app.callback()).get('/ping')
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: 'pong' })
    })
  })

  describe('GET /check', () => {
    it('should return status 200 and message "Check route"', async () => {
      const response = await request(app.callback()).get('/check')
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: 'Check route' })
    })
  })
})
