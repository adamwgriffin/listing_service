import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import * as dotenv from 'dotenv'
import router from './routes/router'
import { errorMiddleware } from './middlewares/error_middleware'

dotenv.config()

const app = new Koa()
app.use(errorMiddleware)
app.use(bodyParser())
app.use(router.routes())
app.use(router.allowedMethods())

app.on('error', (err, ctx) => {
  console.error('Server error', err, ctx)
})

export default app
