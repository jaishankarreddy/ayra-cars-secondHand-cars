const mongoose = require('mongoose');

const OFFER_STATUSES = ['Pending', 'Accepted', 'Countered', 'Rejected'];

const VehicleOfferSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true, trim: true }, // e.g. "O-1008"
    vehicleId: {
      type: String,
      required: true,
      index: true,
      ref: 'Vehicle' // matches the readable `vehicles.id`
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, default: '' },
    offerPrice: { type: Number, required: true, min: 0 },
    askingPrice: { type: Number, default: null }, // snapshot of vehicle price
    message: { type: String, default: '' },
    status: { type: String, enum: OFFER_STATUSES, default: 'Pending', index: true },
    counterPrice: { type: Number, default: null },
    dealerNote: { type: String, default: '' }
  },
  { timestamps: true }
);

VehicleOfferSchema.index({ status: 1, createdAt: -1 });
VehicleOfferSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('VehicleOffer', VehicleOfferSchema);