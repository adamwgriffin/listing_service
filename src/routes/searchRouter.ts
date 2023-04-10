import Router from '@koa/router'
import { radiusSearch } from '../controllers/searchController'

export default new Router()
  .get('/radius', radiusSearch)
