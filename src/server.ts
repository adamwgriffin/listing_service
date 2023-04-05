import app from './app'
import { connectToDatabase, disconnectDatabase } from './database'

const startServer = async (): Promise<void> => {
  try {
    await connectToDatabase()
    const port = process.env.APP_PORT || 3001
    app.listen(port, () => {
      console.log(`Server listening on port ${port} 🚀`)
    })
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

const handleExit = async (): Promise<void> => {
  console.log('Cleaning up before closing the server...')
  await disconnectDatabase()
  console.log('Cleanup complete. Closing the server...')
  process.exit(0)
}

process.on('SIGTERM', handleExit)

startServer()
