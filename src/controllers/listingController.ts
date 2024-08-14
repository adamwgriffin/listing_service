import { Types } from 'mongoose'
import Listing from '../models/ListingModel'
import { DefaultListingDetailResultFields } from '../config'
import { daysOnMarket } from '../lib/listing_search_helpers'

export const createListing = async (ctx) => {
  try {
    const listing = await Listing.create(ctx.request.body)
    ctx.status = 201
    ctx.body = listing
  } catch (error) {
    ctx.body = { error }
    ctx.status = 400
  }
}

export const readListing = async (ctx) => {
  try {
    const { id } = ctx.params
    if (!Types.ObjectId.isValid(id)) {
      ctx.status = 422
      ctx.body = { message: `Invalid ID ${id}` }
      return
    }
    const listing = await Listing.findById(id, DefaultListingDetailResultFields)
    if (!listing) {
      ctx.status = 404
      ctx.body = { message: `Listing not found with ID ${id}` }
    } else {
      ctx.body = {
        ...listing.toObject(),
        daysOnMarket: daysOnMarket(listing.listedDate, listing.soldDate)
      }
    }
  } catch (error) {
    ctx.body = { error }
    ctx.status = 400
  }
}

export const updateListing = async (ctx) => {
  const { id } = ctx.params
  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      ctx.request.body,
      { new: true }
    )
    if (!updatedListing) {
      ctx.status = 404
      ctx.body = { message: `Listing with ID ${id} not found` }
    } else {
      ctx.body = updatedListing
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = { message: error.message }
  }
}

export const deleteListing = async (ctx) => {
  const { id } = ctx.params
  try {
    const deletedListing = await Listing.findByIdAndDelete(id)
    if (!deletedListing) {
      ctx.status = 404
      ctx.body = { message: `Listing with ID ${id} not found` }
    } else {
      ctx.status = 204
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = { message: error.message }
  }
}
