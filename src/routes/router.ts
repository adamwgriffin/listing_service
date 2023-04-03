import Router from '@koa/router'
import diagnosticsRouter from './diagnosticsRouter'
import listingRouter from './listingRouter'

export default new Router()
  .use(diagnosticsRouter.routes())
  .use('/listing', listingRouter.routes())
