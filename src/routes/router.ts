import Router from '@koa/router'
import diagnosticsRouter from './diagnosticsRouter'
import listingRouter from './listingRouter'
import boundaryRouter from './boundaryRouter'
import geocodeRouter from './geocodeRouter'

export default new Router()
  .use(diagnosticsRouter.routes())
  .use('/listing', listingRouter.routes())
  .use('/boundary', boundaryRouter.routes())
  .use('/geocode', geocodeRouter.routes())

