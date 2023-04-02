import mongoose from 'mongoose'
import { mongodbUrl, mongodbOptions } from './config'

mongoose.connection.on('error', (e) => {
  console.log('MongoDB connection error:', e)
})

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB')
})

export const connectToDatabase = async () => {
  return await mongoose.connect(mongodbUrl, mongodbOptions)
}

export default mongoose.connection
