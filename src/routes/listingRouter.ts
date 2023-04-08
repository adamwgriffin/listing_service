import Router from '@koa/router'
import { createListing, readListing, updateListing, deleteListing } from '../controllers/listingController'

export default new Router()
  .post('/', createListing)
  .get('/:id', readListing)
  .put('/:id', updateListing)
  .delete('/:id', deleteListing)
