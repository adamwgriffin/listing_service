import mongoose from 'mongoose'
import { MongoDbUrl, MongoDbOptions } from './config'

mongoose.connection.on('error', (e) => {
  console.log('MongoDB connection error:', e)
})

export const connectToDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(MongoDbUrl, MongoDbOptions)
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close()
    console.log('MongoDB disconnected')
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}
