import Router from '@koa/router'
import { listing, create } from '../controllers/listingController'

export default new Router()
  .get('/:id', listing)
  .post('/create', create)
