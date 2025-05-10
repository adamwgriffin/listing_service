import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import router from './routes/router'
import { errorMiddleware } from './middlewares/error_middleware'

const app = new Koa()
app.use(errorMiddleware)
app.use(bodyParser())
app.use(router.routes())
app.use(router.allowedMethods())

export default app
