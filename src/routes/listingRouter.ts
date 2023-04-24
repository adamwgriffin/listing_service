import Router from '@koa/router'
import listingSearchRouter from './listingSearchRouter'
import { createListing, readListing, updateListing, deleteListing } from '../controllers/listingController'

export default new Router()
  .post('/', createListing)
  .get('/:id', readListing)
  .put('/:id', updateListing)
  .delete('/:id', deleteListing)
  .use('/search', listingSearchRouter.routes())
