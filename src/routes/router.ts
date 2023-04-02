import Router from '@koa/router'
import diagnosticsRouter from './diagnosticsRouter'
import searchRouter from './searchRouter'

export default new Router()
  .use(diagnosticsRouter.routes())
  .use('/search', searchRouter.routes())

