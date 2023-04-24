import Router from '@koa/router'
import { createBoundary, searchBoundary } from '../controllers/boundaryController'

export default new Router()
  .post('/', createBoundary)
  .get('/search', searchBoundary)
