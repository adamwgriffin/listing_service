const { DB_PORT, DB_NAME } = process.env
export default {
  Memory: true,
  IP: '127.0.0.1',
  Port: DB_PORT,
  Database: DB_NAME
}
