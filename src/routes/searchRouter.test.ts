import request from 'supertest'
import Koa from 'koa'
import Router from '@koa/router'
import { radiusSearch } from '../controllers/searchController'

jest.mock('../models/listingModel', () => ({
  async aggregate() {
    return {
      near() {
        return {
          maxDistance() {
            return {
              spherical() {
                return {
                  distanceField() {
                    return [
                      { id: 1, name: 'Listing 1' },
                      { id: 2, name: 'Listing 2' }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}))

describe.skip('GET /search/radius', () => {
  const app = new Koa()
  const router = new Router()

  router.get('/search/radius', radiusSearch)
  app.use(router.routes())

  test('should return a list of listings', async () => {
    const response = await request(app.callback()).get(
      '/search/radius?lat=40.7128&lng=-74.006&maxDistance=1000'
    )

    expect(response.status).toBe(200)
    expect(response.body).toEqual([
      { id: 1, name: 'Listing 1' },
      { id: 2, name: 'Listing 2' }
    ])
  })

  test('should return an error message for invalid parameters', async () => {
    const response = await request(app.callback()).get('/search/radius')

    expect(response.status).toBe(500)
    expect(response.body).toEqual({
      message: 'lat is required, lng is required'
    })
  })
})
