import Router from '@koa/router'
import { radiusSearch, boundarySearch, geocodeBoundarySearch } from '../controllers/listingSearchController'

export default new Router()
  .get('/radius', radiusSearch)
  .get('/boundary/:id', boundarySearch)
  .get('/geocode', geocodeBoundarySearch)
