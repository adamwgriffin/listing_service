import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import router from './routes/router'
import { errorMiddleware } from './middlewares/error_middleware'
import type { IRepositories } from './respositories'
import { type IGeocoderService } from './services/geocoderService'

declare module 'koa' {
  interface DefaultContext {
    repositories: IRepositories
    geocodeService: IGeocoderService
  }
}

const app = new Koa()
app
  .use(errorMiddleware)
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())

export default app
