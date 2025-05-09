import Router from '@koa/router'
import diagnosticsRouter from './diagnosticsRouter'
import listingRouter from './listingRouter'
import listingsRouter from './listingsRouter'

export default new Router()
  .use(diagnosticsRouter.routes())
  .use('/listing', listingRouter.routes())
  .use('/listings', listingsRouter.routes())
