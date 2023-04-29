import Router from '@koa/router'
import {
  geocodeBoundarySearch,
  boundarySearch,
  radiusSearch,
} from '../controllers/listingSearchController'

export default new Router()
  .get('/geocode', geocodeBoundarySearch)
  .get('/boundary/:id', boundarySearch)
  .get('/radius', radiusSearch)
