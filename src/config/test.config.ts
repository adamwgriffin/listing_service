import env from '../lib/env'

const { DB_PORT, DB_NAME } = env
export default {
  Memory: true,
  IP: '127.0.0.1',
  Port: DB_PORT,
  Database: DB_NAME
}
