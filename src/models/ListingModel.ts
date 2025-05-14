import type { Point } from '@turf/turf'
import mongoose, { Model, Schema, model } from 'mongoose'
import slugify from 'slugify'
import type { ListingAddress } from '../zod_schemas/listingSchema'
import PointSchema from './PointSchema'

export const PropertyTypes = [
  'single-family',
  'condo',
  'townhouse',
  'manufactured',
  'land',
  'multi-family'
] as const

export const PropertyStatuses = ['active', 'pending', 'sold'] as const

export const RentalPropertyStatuses = ['active', 'rented'] as const

export const AllPropertyStatuses = [
  ...PropertyStatuses,
  ...RentalPropertyStatuses
]

export type PropertyType = (typeof PropertyTypes)[number]

export type PropertyStatus = (typeof AllPropertyStatuses)[number]

export interface PhotoGalleryImage {
  url: string
  caption?: string
}

export interface PropertDetail {
  name: string
  details: string[]
}

export interface PropertDetailsSection {
  name: string
  description?: string
  details: PropertDetail[]
}

export interface OpenHouse {
  start: Date
  end: Date
  comments?: string
}

export interface ListingAmenities {
  waterfront?: boolean
  view?: boolean
  fireplace?: boolean
  basement?: boolean
  garage?: boolean
  newConstruction?: boolean
  pool?: boolean
  airConditioning?: boolean
}

export interface IListing extends ListingAmenities {
  listPrice: number
  soldPrice?: number
  listedDate: Date
  soldDate?: Date
  address: ListingAddress
  slug: string
  geometry: Point
  placeId?: string
  neighborhood: string
  propertyType: PropertyType
  status: PropertyStatus
  description?: string
  beds: number
  baths: number
  sqft: number
  lotSize: number
  yearBuilt: number
  rental?: boolean
  photoGallery?: PhotoGalleryImage[]
  propertyDetails?: PropertDetailsSection[]
  openHouses?: OpenHouse[]
}

const ListingSchema = new Schema<IListing>({
  listPrice: {
    type: Number,
    required: true,
    index: true
  },
  soldPrice: {
    type: Number,
    required: false,
    index: true
  },
  listedDate: {
    type: Date,
    required: true,
    index: true
  },
  soldDate: {
    type: Date,
    required: false,
    index: true
  },
  address: {
    line1: {
      type: String,
      required: true,
      minlength: 1
    },
    line2: String,
    city: {
      type: String,
      required: true,
      minlength: 1
    },
    state: {
      type: String,
      required: true,
      minlength: 1
    },
    zip: {
      type: String,
      required: true,
      minlength: 1
    }
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  geometry: {
    type: PointSchema,
    index: '2dsphere',
    required: true
  },
  placeId: {
    type: String,
    index: true
  },
  neighborhood: {
    type: String,
    required: true
  },
  propertyType: {
    type: String,
    enum: PropertyTypes,
    required: true,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: AllPropertyStatuses,
    default: 'active',
    index: true
  },
  description: String,
  beds: {
    type: Number,
    required: true,
    index: true
  },
  baths: {
    type: Number,
    required: true,
    index: true
  },
  sqft: {
    type: Number,
    required: true
  },
  lotSize: {
    type: Number,
    required: true
  },
  yearBuilt: {
    type: Number,
    required: true
  },
  rental: {
    type: Boolean,
    required: false,
    index: true
  },
  waterfront: {
    type: Boolean,
    default: false
  },
  view: {
    type: Boolean,
    default: false
  },
  fireplace: {
    type: Boolean,
    default: false
  },
  basement: {
    type: Boolean,
    default: false
  },
  garage: {
    type: Boolean,
    default: false
  },
  newConstruction: {
    type: Boolean,
    default: false
  },
  pool: {
    type: Boolean,
    default: false
  },
  airConditioning: {
    type: Boolean,
    default: false
  },
  photoGallery: {
    type: [
      {
        url: { type: String, required: true },
        caption: { type: String }
      }
    ],
    required: false,
    default: []
  },
  propertyDetails: {
    type: [
      {
        name: { type: String, required: true },
        description: { type: String },
        details: [
          {
            name: { type: String, required: true },
            details: { type: [String], required: true }
          }
        ]
      }
    ],
    required: false,
    default: []
  },
  openHouses: {
    type: [
      {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
        comments: { type: String }
      }
    ],
    default: [],
    required: false
  }
})

ListingSchema.pre('save', async function (next) {
  if (this.isModified('address') || !this.slug) {
    const address = Object.values(this.address).filter(Boolean).join(' ')
    const baseSlug = slugify(address, { lower: true, strict: true })
    let slug = baseSlug
    let count = 0
    while (await mongoose.models.Listing.exists({ slug })) {
      count += 1
      slug = `${baseSlug}-${count}`
    }
    this.slug = slug
  }
  next()
})

export default (mongoose.models.Listing as Model<IListing>) ||
  model<IListing, Model<IListing>>('Listing', ListingSchema)
