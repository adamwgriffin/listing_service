import Router from '@koa/router'
import { listing } from '../controllers/searchController'

export default new Router()
  .get('/listing/:id', listing)
