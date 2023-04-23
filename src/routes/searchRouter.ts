import Router from '@koa/router'
import { radiusSearch, boundarySearch } from '../controllers/searchController'

export default new Router()
  .get('/radius', radiusSearch)
  .get('/boundary', boundarySearch)
