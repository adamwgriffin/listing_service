import Router from '@koa/router'
import diagnosticsRouter from './diagnosticsRouter'
import listingRouter from './listingRouter'
import boundaryRouter from './boundaryRouter'

export default new Router()
  .use(diagnosticsRouter.routes())
  .use('/listing', listingRouter.routes())
  .use('/boundary', boundaryRouter.routes())
