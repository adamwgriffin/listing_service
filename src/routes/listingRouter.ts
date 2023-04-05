import Router from '@koa/router'
import { listing, create, deleteListing } from '../controllers/listingController'

export default new Router()
  .get('/:id', listing)
  .post('/create', create)
  .delete('/:id', deleteListing)
