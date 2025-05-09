import Router from '@koa/router'
import listingSearchRouter from './listingSearchRouter'
import { getListingById } from '../controllers/listingController'

export default new Router()
  .get('/:id', getListingById)
  .use('/search', listingSearchRouter.routes())
