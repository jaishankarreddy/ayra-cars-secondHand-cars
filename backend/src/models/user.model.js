const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: { type: String, default: '', unique: true, sparse: true },
    passwordHash: { type: String, default: '' },
    googleId: { type: String, sparse: true, unique: true },
    role: { type: String, enum: ['user'], default: 'user' },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    avatar: { type: String, default: '' },
    wishlist: { type: [String], default: [] },
    preferences: {
      notifyOffers: { type: Boolean, default: true },
      notifyNewsletter: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (this.isModified('passwordHash') && this.passwordHash) {
    // avoid double-hashing if already hashed (bcrypt hashes start with $2a/$2b)
    if (!this.passwordHash.startsWith('$2a') && !this.passwordHash.startsWith('$2b')) {
      this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    }
  }
  next();
});

UserSchema.methods.comparePassword = function (candidate) {
  if (!this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.passwordHash);
};

UserSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);