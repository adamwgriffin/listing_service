import Router from '@koa/router'
import healthcheckRouter from './healthcheckRouter'
import listingRouter from './listingRouter'
import listingsRouter from './listingsRouter'

export default new Router()
  .use(healthcheckRouter.routes())
  .use('/listing', listingRouter.routes())
  .use('/listings', listingsRouter.routes())
