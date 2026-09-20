const mongoose = require('mongoose');
const { Schema } = mongoose;

const VEHICLE_TYPES = ['car', 'bike'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
const TRANSMISSIONS = ['Manual', 'Automatic', 'Electric'];
const CAR_BODY_TYPES = ['SUV', 'Sedan', 'Hatchback', 'MPV', 'Crossover'];
const BIKE_BODY_TYPES = [
  'Commuter',
  'Scooter',
  'Sport',
  'Street',
  'Cruiser',
  'Adventure',
  'Streetfighter',
  'Tourer',
  'Electric Scooter'
];
const AVAILABILITIES = ['available', 'reserved', 'sold'];

const featureKeyValidator = (key) =>
  ['safety', 'comfort', 'exterior', 'interior', 'entertainment'].includes(key);

const SellerSchema = new Schema(
  {
    name: { type: String, required: true },
    verified: { type: Boolean, default: false },
    hours: { type: String, default: '' },
    location: { type: String, default: '' },
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    deals: { type: Number, default: 0 }
  },
  { _id: false }
);

const FeatureGroupSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      validate: {
        validator: featureKeyValidator,
        message: (props) => `${props.value} is not a valid feature group key`
      }
    },
    icon: { type: String, default: '' },
    title: { type: String, required: true },
    items: { type: [String], default: [] }
  },
  { _id: false }
);

const VehicleSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, trim: true }, // readable slug e.g. car-01
    vehicleType: { type: String, required: true, enum: VEHICLE_TYPES, index: true },

    // Identity
    brand: { type: String, required: true, index: true },
    model: { type: String, required: true },
    variant: { type: String, default: '' },

    // Pricing & listing
    year: { type: Number, required: true },
    price: { type: Number, required: true, index: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    featured: { type: Boolean, default: false, index: true },
    availability: { type: String, enum: AVAILABILITIES, default: 'available', index: true },

    // Specs (car + bike shared)
    fuel: { type: String, enum: FUEL_TYPES, required: true, index: true },
    transmission: { type: String, enum: TRANSMISSIONS, default: 'Manual' },
    mileage: { type: Number, default: 0 }, // km/l (or km/charge for electric)
    kilometers: { type: Number, default: 0 },
    district: { type: String, default: '', index: true },
    location: { type: String, default: '' },
    owners: { type: Number, default: 1 },
    bodyType: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          const list = this.vehicleType === 'bike' ? BIKE_BODY_TYPES : CAR_BODY_TYPES;
          return list.includes(v);
        },
        message: (props) => `${props.value} is not a valid body type for this vehicle`
      }
    },
    color: { type: String, default: '' },

    // Bike-only
    engineCC: { type: Number, default: 0 }, // 0 for electric bikes
    abs: { type: Boolean, default: false },

    // Detail page extras
    engine: { type: String, default: '' }, // "1493 cc"
    power: { type: String, default: '' }, // "113 bhp"
    registration: { type: String, default: '' }, // "KA 01 MK 8214"
    insurance: { type: String, default: '' }, // "Valid till Mar 2027"

    // Media & content
    image: { type: String, default: '' }, // primary/hero
    images: { type: [String], default: [] }, // gallery
    description: { type: [String], default: [] }, // paragraphs

    // Embedded sub-documents
    features: { type: [FeatureGroupSchema], default: [] },
    seller: { type: SellerSchema, default: () => ({}) }
  },
  { timestamps: true }
);

// Compound indexes for the listing/filter pages
VehicleSchema.index({ vehicleType: 1, brand: 1 });
VehicleSchema.index({ vehicleType: 1, fuel: 1 });
VehicleSchema.index({ vehicleType: 1, district: 1 });
VehicleSchema.index({ vehicleType: 1, featured: 1 });
VehicleSchema.index({ brand: 1, model: 1, variant: 1 });
VehicleSchema.index({ vehicleType: 1, price: 1 });
VehicleSchema.index({ vehicleType: 1, year: -1 });

VehicleSchema.pre('save', function (next) {
  if (this.brand) this.brand = this.brand.toLowerCase();
  next();
});

module.exports = mongoose.model('Vehicle', VehicleSchema);