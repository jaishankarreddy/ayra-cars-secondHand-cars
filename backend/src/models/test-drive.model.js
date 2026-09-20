const mongoose = require('mongoose');

const TestDriveSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true, trim: true },
    vehicleId: { type: String, required: true, index: true },
    vehicleLabel: { type: String, default: '' },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    preferredDate: { type: String, default: '' },
    preferredTime: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
      index: true
    },
    note: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TestDrive', TestDriveSchema);
