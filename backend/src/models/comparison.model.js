const mongoose = require('mongoose');

const MAX_COMPARE = 4;

const ComparisonSchema = new mongoose.Schema(
  {
    // Either the logged-in user OR a browser session id for guests
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    sessionId: { type: String, default: null },
    vehicleIds: {
      type: [String],
      ref: 'Vehicle',
      default: [],
      validate: {
        validator: (arr) => arr.length <= MAX_COMPARE,
        message: `A comparison can hold at most ${MAX_COMPARE} vehicles`
      }
    }
  },
  { timestamps: true }
);

// One comparison basket per user/session
ComparisonSchema.index({ userId: 1 }, { unique: true, partialFilterExpression: { userId: { $type: 'objectId' } } });
ComparisonSchema.index({ sessionId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Comparison', ComparisonSchema);