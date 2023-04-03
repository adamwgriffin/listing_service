import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import * as dotenv from 'dotenv'
import router from './routes/router'
import { connectToDatabase } from './db'

dotenv.config()

const app = new Koa()

app.use(bodyParser())
app.use(router.routes())

const main = async () => {
  try {
    await connectToDatabase()
    const port = process.env.APP_PORT || 3001
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`)
    })
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

main()
