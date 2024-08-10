import mongoose from 'mongoose'
import { MongoDbUrl, MongoDbOptions } from './config'

mongoose.connection.on('error', (e) => {
  console.error('MongoDB connection error:', e)
})

export const connectToDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(MongoDbUrl, MongoDbOptions)
    console.debug(`MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close()
    console.debug('MongoDB disconnected')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
