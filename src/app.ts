import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import router from './routes/router'
import { errorMiddleware } from './middlewares/error_middleware'
import type { Repositories } from './respositories'

declare module 'koa' {
  interface DefaultContext {
    repositories: Repositories
  }
}

const app = new Koa()
app
  .use(errorMiddleware)
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())

export default app
