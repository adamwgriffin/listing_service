import Router from '@koa/router'
import {
  geocodeBoundarySearch,
  boundarySearch,
  boundsSearch,
  radiusSearch,
} from '../controllers/listingSearchController'

export default new Router()
  .get('/geocode', geocodeBoundarySearch)
  .get('/boundary/:id', boundarySearch)
  .get('/bounds', boundsSearch)
  .get('/radius', radiusSearch)
