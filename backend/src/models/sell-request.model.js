const mongoose = require('mongoose');

const SellRequestStatusSchema = ['New', 'Contacted', 'Closed'];

const SellRequestSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true, trim: true }, // e.g. "SR-1001"
    vehicleType: { type: String, enum: ['car', 'bike'], default: 'car', index: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, default: null },
    kilometers: { type: Number, default: null },
    fuel: { type: String, default: '' },
    transmission: { type: String, default: '' },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    district: { type: String, default: '' },
    expectedPrice: { type: Number, default: null },
    notes: { type: String, default: '' },
    images: { type: [String], default: [] }, // seller-uploaded photos (Cloudinary URLs, max 10)
    status: { type: String, enum: SellRequestStatusSchema, default: 'New', index: true }
  },
  { timestamps: true }
);

SellRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('SellRequest', SellRequestSchema);
