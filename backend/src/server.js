// Ayra Cars backend — minimal Express server
// Demonstrates the DB design with a few core endpoints.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { connectDB } = require('./config/db');

const Admin = require('./models/admin.model');
const User = require('./models/user.model');
const Vehicle = require('./models/vehicle.model');
const Brand = require('./models/brand.model');
const VehicleOffer = require('./models/vehicle-offer.model');
const ContactMessage = require('./models/contact-message.model');
const TestDrive = require('./models/test-drive.model');
const SellRequest = require('./models/sell-request.model');
const Testimonial = require('./models/testimonial.model');
const Faq = require('./models/faq.model');
const HomepageStat = require('./models/homepage-stat.model');
const Comparison = require('./models/comparison.model');
const { AdminSetting, NOTIFICATION_TOGGLES, MARKETPLACE_TOGGLES } = require('./models/admin-setting.model');

const app = express();
const configuredOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);
const allowedOrigins = new Set([
  ...configuredOrigins,
  'https://ayracars.in'
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Image uploads (Cloudinary) ----------------------------------------------
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const CLOUDINARY_FOLDER = 'ayracars/vehicles';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /^image\//.test(file.mimetype))
});

// Upload a buffer to Cloudinary and resolve the secure URL.
function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: CLOUDINARY_FOLDER, resource_type: 'image' },
      (err, result) => (err || !result ? reject(err || new Error('Upload failed')) : resolve(result.secure_url))
    );
    stream.end(file.buffer);
  });
}

// Delete a Cloudinary image by URL (best-effort; ignores local /uploads paths).
async function cleanUpload(imageUrl) {
  try {
    if (!imageUrl || !imageUrl.includes('res.cloudinary.com')) return;
    const match = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
    if (!match) return;
    await cloudinary.uploader.destroy(`${match[1]}`);
  } catch (err) {
    console.error('Failed to clean uploaded image:', err.message);
  }
}

// Fields the admin form may submit (everything else is ignored).
const VEHICLE_FIELDS = [
  'vehicleType', 'brand', 'model', 'variant', 'year', 'price', 'rating',
  'featured', 'availability', 'fuel', 'transmission', 'mileage', 'kilometers',
  'district', 'location', 'owners', 'bodyType', 'color', 'engineCC', 'abs',
  'engine', 'power', 'registration', 'insurance', 'description'
];

function toBool(v) {
  if (v === undefined) return undefined;
  return v === true || v === 'true' || v === '1';
}

function buildVehiclePayload(body) {
  const payload = {};
  for (const field of VEHICLE_FIELDS) {
    if (body[field] === undefined) continue;
    const val = body[field];
    switch (field) {
      case 'vehicleType':
        if (val === 'car' || val === 'bike') payload.vehicleType = val;
        break;
      case 'year':
      case 'price':
      case 'rating':
      case 'mileage':
      case 'kilometers':
      case 'owners':
      case 'engineCC':
        payload[field] = Number(val);
        break;
      case 'featured':
      case 'abs':
        payload[field] = toBool(val);
        break;
      case 'description':
        payload[field] = String(val)
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      default:
        payload[field] = String(val).trim();
    }
  }
  return payload;
}

async function nextVehicleId(vehicleType) {
  const docs = await Vehicle.find({ vehicleType }, 'id').lean();
  const nums = docs.map((d) => parseInt(String(d.id).replace(/\D/g, ''), 10) || 0);
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${vehicleType}-${String(next).padStart(2, '0')}`;
}

// Health
app.get('/', (_req, res) => res.json({ status: 'ok', service: 'ayracars-api' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'ayracars-api' }));

// --- User authentication ------------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || 'ayracars-dev-secret-change-me';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
let googleClient = null;
try {
  const { OAuth2Client } = require('google-auth-library');
  if (GOOGLE_CLIENT_ID) googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
} catch (e) { console.warn('google-auth-library not available', e.message); }

function signUserToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Require a valid user JWT. Populates req.userId.
function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'You must be logged in to do that.' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
  }
}

// Require a valid admin JWT with role admin or super_admin. Populates req.adminId.
function adminRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Admin authentication required.' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin' && payload.role !== 'super_admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }
    req.adminId = payload.sub;
    req.adminRole = payload.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Admin session expired. Please log in again.' });
  }
}

// POST /api/auth/register — create a user account with phone + password
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { phone, password } = req.body || {};
    if (!phone || !password) {
      return res.status(400).json({ message: 'Mobile number and password are required.' });
    }
    const normalized = String(phone).trim().replace(/\s+/g, '');
    if (!/^\d{10,15}$/.test(normalized)) {
      return res.status(400).json({ message: 'Please enter a valid mobile number.' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const existing = await User.findOne({ phone: normalized });
    if (existing) {
      return res.status(409).json({ message: 'An account with this mobile number already exists. Please login.' });
    }
    const user = await User.create({
      name: 'User',
      email: `${normalized}@phone.ayracars.in`,
      phone: normalized,
      passwordHash: String(password)
    });
    const token = signUserToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login — sign a user in with phone + password
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { phone, password } = req.body || {};
    if (!phone || !password) {
      return res.status(400).json({ message: 'Mobile number and password are required.' });
    }
    const normalized = String(phone).trim().replace(/\s+/g, '');
    const user = await User.findOne({ phone: normalized });
    if (!user || !(await user.comparePassword(String(password)))) {
      return res.status(401).json({ message: 'Invalid mobile number or password.' });
    }
    const token = signUserToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me — current user from token
app.get('/api/auth/me', authRequired, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/auth/me — update current user profile (name, email, phone, avatar)
app.patch('/api/auth/me', authRequired, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const { name, email, phone, avatar } = req.body || {};
    if (name !== undefined) {
      const n = String(name).trim();
      if (!n) return res.status(400).json({ message: 'Name cannot be empty.' });
      user.name = n;
    }
    if (email !== undefined) {
      const e = String(email).trim().toLowerCase();
      if (e && !/^\S+@\S+\.\S+$/.test(e)) return res.status(400).json({ message: 'Please provide a valid email address.' });
      if (e && e !== user.email) {
        const exists = await User.findOne({ email: e });
        if (exists) return res.status(409).json({ message: 'An account with this email already exists.' });
        user.email = e;
        user.emailVerified = false;
      }
    }
    if (phone !== undefined) {
      const p = String(phone).trim().replace(/\s+/g, '');
      if (p && !/^\d{10,15}$/.test(p)) return res.status(400).json({ message: 'Please enter a valid mobile number.' });
      if (p && p !== user.phone) {
        const exists = await User.findOne({ phone: p });
        if (exists) return res.status(409).json({ message: 'An account with this mobile number already exists.' });
        user.phone = p;
      } else if (!p) {
        user.phone = '';
      }
    }
    if (avatar !== undefined) user.avatar = String(avatar).trim();
    await user.save();
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/google — verify Google ID token and sign in / sign up
app.post('/api/auth/google', async (req, res, next) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) return res.status(400).json({ message: 'Google ID token is required.' });
    if (!GOOGLE_CLIENT_ID || !googleClient) {
      return res.status(500).json({ message: 'Google sign-in is not configured. Set GOOGLE_CLIENT_ID.' });
    }
    const ticket = await googleClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = (payload.email || '').toLowerCase().trim();
    const name = payload.name || 'User';
    const picture = payload.picture || '';
    const emailVerified = !!payload.email_verified;
    if (!email) return res.status(400).json({ message: 'Google account has no email.' });

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      user = await User.create({
        googleId,
        email,
        name,
        avatar: picture,
        emailVerified,
        phone: '',
        passwordHash: ''
      });
    } else {
      let changed = false;
      if (!user.googleId) { user.googleId = googleId; changed = true; }
      if (picture && !user.avatar) { user.avatar = picture; changed = true; }
      if (emailVerified && !user.emailVerified) { user.emailVerified = true; changed = true; }
      if (changed) await user.save();
    }
    const token = signUserToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    console.error('Google auth failed:', err.message);
    res.status(401).json({ message: 'Google authentication failed. Please try again.' });
  }
});

// --- User wishlist ------------------------------------------------------------
// GET /api/wishlist — current user's saved vehicles (full catalogue entries)
app.get('/api/wishlist', authRequired, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const ids = user.wishlist || [];
    const vehicles = await Vehicle.find({ id: { $in: ids } }).lean();
    const order = new Map(ids.map((id, i) => [id, i]));
    vehicles.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    res.json({ wishlist: ids, vehicles });
  } catch (err) {
    next(err);
  }
});

// POST /api/wishlist/:id — add a vehicle to the user's wishlist
app.post('/api/wishlist/:id', authRequired, async (req, res, next) => {
  try {
    console.log(`[Wishlist] POST add ${req.params.id} for user ${req.userId}`);
    const user = await User.findById(req.userId);
    if (!user) {
      console.log(`[Wishlist] User ${req.userId} not found`);
      return res.status(404).json({ message: 'User not found.' });
    }
    const vehicle = await Vehicle.findOne({ id: req.params.id });
    if (!vehicle) {
      console.log(`[Wishlist] Vehicle ${req.params.id} not found`);
      return res.status(404).json({ message: 'Vehicle not found.' });
    }
    if (!user.wishlist.includes(req.params.id)) {
      user.wishlist.push(req.params.id);
      await user.save();
    }
    console.log(`[Wishlist] OK — user ${req.userId} now has ${user.wishlist.length} items`);
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    console.error('[Wishlist] POST error:', err.message);
    next(err);
  }
});

// DELETE /api/wishlist/:id — remove a vehicle from the user's wishlist
app.delete('/api/wishlist/:id', authRequired, async (req, res, next) => {
  try {
    console.log(`[Wishlist] DELETE ${req.params.id} for user ${req.userId}`);
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.wishlist = user.wishlist.filter((id) => id !== req.params.id);
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    console.error('[Wishlist] DELETE error:', err.message);
    next(err);
  }
});

// --- Comparison (guest-friendly, no auth required) -----------------------------
// GET /api/compare?sessionId=xxx — get current comparison basket
app.get('/api/compare', async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) return res.json({ vehicleIds: [] });
    const comp = await Comparison.findOne({ sessionId }).lean();
    res.json({ vehicleIds: comp ? comp.vehicleIds : [] });
  } catch (err) {
    next(err);
  }
});

// POST /api/compare — add vehicles to comparison basket (guest, sessionId-based)
app.post('/api/compare', async (req, res, next) => {
  try {
    const { sessionId, vehicleId } = req.body;
    if (!sessionId || !vehicleId) {
      return res.status(400).json({ message: 'sessionId and vehicleId are required' });
    }
    let comp = await Comparison.findOne({ sessionId });
    if (!comp) {
      comp = await Comparison.create({ sessionId, vehicleIds: [vehicleId] });
    } else {
      if (!comp.vehicleIds.includes(vehicleId)) {
        if (comp.vehicleIds.length >= 4) {
          return res.status(400).json({ message: 'Comparison basket is full (max 4 vehicles)' });
        }
        comp.vehicleIds.push(vehicleId);
        await comp.save();
      }
    }
    res.json({ vehicleIds: comp.vehicleIds });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/compare/:vehicleId — remove a vehicle from comparison basket
app.delete('/api/compare/:vehicleId', async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) return res.status(400).json({ message: 'sessionId query param is required' });
    const comp = await Comparison.findOne({ sessionId });
    if (!comp) return res.json({ vehicleIds: [] });
    comp.vehicleIds = comp.vehicleIds.filter((id) => id !== req.params.vehicleId);
    await comp.save();
    res.json({ vehicleIds: comp.vehicleIds });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/compare — clear comparison basket
app.delete('/api/compare', async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) return res.status(400).json({ message: 'sessionId query param is required' });
    await Comparison.deleteOne({ sessionId });
    res.json({ vehicleIds: [] });
  } catch (err) {
    next(err);
  }
});

// Admin: sign in (issues a short-lived JWT)
app.post('/api/admin/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() });
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const matches = await admin.comparePassword(String(password));
    if (!matches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    admin.lastLoginAt = new Date();
    await admin.save();

    const token = jwt.sign(
      { sub: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'ayracars-dev-secret-change-me',
      { expiresIn: '12h' }
    );

    res.json({ token, admin: admin.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

// GET /api/vehicles — catalogue listing with filters + pagination
app.get('/api/vehicles', async (req, res, next) => {
  try {
    const {
      type, brand, model, q, minPrice, maxPrice, fuel, transmission, bodyType,
      district, color, minYear, maxYear, year, owners, abs, engineCc, engineCcMin,
      engineCcMax, mileageMax, maxKm, minKm, featured, sortBy, page = 1, limit = 12
    } = req.query;

    // Repeated query params (e.g. ?brand=A&brand=B) arrive as arrays → $in.
    const asArray = (v) => (v === undefined ? undefined : Array.isArray(v) ? v : [v]);
    const asNumbers = (v) => asArray(v)?.map((x) => Number(x));

    const filter = {};
    if (type) filter.vehicleType = type;
    if (asArray(brand)?.length) {
      const brandPatterns = asArray(brand).map((b) => new RegExp(`^${b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'));
      filter.brand = { $in: brandPatterns };
    }
    if (asArray(model)?.length) filter.model = { $in: asArray(model) };
    if (asArray(fuel)?.length) filter.fuel = { $in: asArray(fuel) };
    if (asArray(transmission)?.length) filter.transmission = { $in: asArray(transmission) };
    if (asArray(bodyType)?.length) filter.bodyType = { $in: asArray(bodyType) };
    if (asArray(district)?.length) filter.district = { $in: asArray(district) };
    if (asArray(color)?.length) filter.color = { $in: asArray(color) };
    if (asNumbers(owners)?.length) filter.owners = { $in: asNumbers(owners) };
    if (asNumbers(year)?.length) filter.year = { $in: asNumbers(year) };
    if (abs !== undefined) filter.abs = abs === 'true';
    if (engineCc) filter.engineCC = Number(engineCc);
    if (engineCcMin || engineCcMax) {
      filter.engineCC = { ...(filter.engineCC || {}) };
      if (engineCcMin) filter.engineCC.$gte = Number(engineCcMin);
      if (engineCcMax) filter.engineCC.$lte = Number(engineCcMax);
    }
    if (featured) filter.featured = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minYear || maxYear) {
      filter.year = {};
      if (minYear) filter.year.$gte = Number(minYear);
      if (maxYear) filter.year.$lte = Number(maxYear);
    }
    if (mileageMax) filter.mileage = { $lte: Number(mileageMax) };
    if (maxKm || minKm) {
      filter.kilometers = {};
      if (minKm) filter.kilometers.$gte = Number(minKm);
      if (maxKm) filter.kilometers.$lte = Number(maxKm);
    }
    if (q) {
      const qRegex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { brand: qRegex },
        { model: qRegex },
        { variant: qRegex },
        { district: qRegex }
      ];
    }

    const sort = {};
    if (sortBy === 'price_asc') sort.price = 1;
    else if (sortBy === 'price_desc') sort.price = -1;
    else if (sortBy === 'mileage_desc') sort.mileage = -1;
    else sort.createdAt = -1; // newest uploads first (default + 'newest' + 'year_desc')

    const skip = (Number(page) - 1) * Number(limit);
    const LIST_PROJECTION =
      'id vehicleType brand model variant year price rating featured availability ' +
      'fuel transmission mileage kilometers district location owners bodyType color ' +
      'engineCC abs engine power registration insurance image images';
    const [items, total] = await Promise.all([
      Vehicle.find(filter).select(LIST_PROJECTION).sort(sort).skip(skip).limit(Number(limit)).lean(),
      Vehicle.countDocuments(filter)
    ]);

    res.json({ items, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
});

// GET /api/vehicles/:id — full detail
app.get('/api/vehicles/:id', async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ id: req.params.id }).lean();
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
});

// GET /api/brands
app.get('/api/brands', async (_req, res, next) => {
  try {
    res.json(await Brand.find().sort({ name: 1 }).lean());
  } catch (err) {
    next(err);
  }
});

// GET /api/brands/directory — brands with vehicle counts for home-page directory
app.get('/api/brands/directory', async (_req, res, next) => {
  try {
    const counts = await Vehicle.aggregate([
      { $group: { _id: '$brand', count: { $sum: 1 } } }
    ]);
    const countMap = new Map(counts.map((c) => [c._id, c.count]));
    const brands = await Brand.find().sort({ name: 1 }).lean();
    const result = brands
      .map((b) => ({
        name: b.name,
        code: b.code,
        color: b.color,
        logo: b.logo,
        type: b.type,
        count: countMap.get(b.name) || 0
      }))
      .filter((b) => b.count > 0);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/facets?type=car|bike — distinct filter options for the sidebar
app.get('/api/facets', async (req, res, next) => {
  try {
    const type = req.query.type === 'bike' ? 'bike' : 'car';
    const base = { vehicleType: type };
    const [rawBrands, models, years, fuels, transmissions, owners, bodyTypes, districts, colors, price, engineCc, mileage, count] =
      await Promise.all([
        Vehicle.distinct('brand', base),
        Vehicle.distinct('model', base),
        Vehicle.distinct('year', base),
        Vehicle.distinct('fuel', base),
        Vehicle.distinct('transmission', base),
        Vehicle.distinct('owners', base),
        Vehicle.distinct('bodyType', base),
        Vehicle.distinct('district', base),
        Vehicle.distinct('color', base),
        Vehicle.aggregate([
          { $match: base },
          { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } }
        ]),
        Vehicle.aggregate([
          { $match: base },
          { $group: { _id: null, max: { $max: '$engineCC' } } }
        ]),
        Vehicle.aggregate([
          { $match: base },
          { $group: { _id: null, max: { $max: '$mileage' } } }
        ]),
        Vehicle.countDocuments(base)
      ]);

    // Price + KMs-driven bucket counts (used for the bike sidebar).
    let priceBuckets = [];
    let kmBuckets = [];
    if (type === 'bike') {
      const bucketAgg = await Vehicle.aggregate([
        { $match: base },
        {
          $group: {
            _id: null,
            p50: { $sum: { $cond: [{ $lte: ['$price', 50000] }, 1, 0] } },
            p75: { $sum: { $cond: [{ $lte: ['$price', 75000] }, 1, 0] } },
            p100: { $sum: { $cond: [{ $lte: ['$price', 100000] }, 1, 0] } },
            p125: { $sum: { $cond: [{ $lte: ['$price', 125000] }, 1, 0] } },
            p150: { $sum: { $cond: [{ $lte: ['$price', 150000] }, 1, 0] } },
            p200: { $sum: { $cond: [{ $lte: ['$price', 200000] }, 1, 0] } },
            p300: { $sum: { $cond: [{ $lte: ['$price', 300000] }, 1, 0] } },
            above300: { $sum: { $cond: [{ $gt: ['$price', 300000] }, 1, 0] } },
            k5: { $sum: { $cond: [{ $lte: ['$kilometers', 5000] }, 1, 0] } },
            k10: { $sum: { $cond: [{ $lte: ['$kilometers', 10000] }, 1, 0] } },
            k15: { $sum: { $cond: [{ $lte: ['$kilometers', 15000] }, 1, 0] } },
            k20: { $sum: { $cond: [{ $lte: ['$kilometers', 20000] }, 1, 0] } }
          }
        }
      ]);
      const b = bucketAgg[0] || {};
      priceBuckets = [
        { threshold: 50000, count: b.p50 ?? 0 },
        { threshold: 75000, count: b.p75 ?? 0 },
        { threshold: 100000, count: b.p100 ?? 0 },
        { threshold: 125000, count: b.p125 ?? 0 },
        { threshold: 150000, count: b.p150 ?? 0 },
        { threshold: 200000, count: b.p200 ?? 0 },
        { threshold: 300000, count: b.p300 ?? 0 },
        { threshold: null, count: b.above300 ?? 0 }
      ];
      kmBuckets = [
        { threshold: 5000, count: b.k5 ?? 0 },
        { threshold: 10000, count: b.k10 ?? 0 },
        { threshold: 15000, count: b.k15 ?? 0 },
        { threshold: 20000, count: b.k20 ?? 0 }
      ];
    }

    const brands = rawBrands.map((b) => b.toLowerCase());

    res.json({
      type,
      brands,
      models,
      years,
      fuels,
      transmissions,
      owners,
      bodyTypes,
      districts,
      colors,
      priceMin: price[0] ? price[0].min : 0,
      priceMax: price[0] ? price[0].max : 0,
      engineCcMin: 100,
      engineCcMax: engineCc[0] ? engineCc[0].max : 650,
      mileageMax: mileage[0] ? mileage[0].max : 60,
      count,
      priceBuckets,
      kmBuckets
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/testimonials — active customer testimonials
app.get('/api/testimonials', async (_req, res, next) => {
  try {
    const list = await Testimonial.find({ isActive: true }).sort({ createdAt: 1 }).lean();
    res.json(list.map((t) => ({
      id: String(t._id),
      name: t.name,
      role: t.role,
      quote: t.quote,
      rating: t.rating,
      color: t.color
    })));
  } catch (err) {
    next(err);
  }
});

// GET /api/faqs — ordered FAQ list
app.get('/api/faqs', async (_req, res, next) => {
  try {
    const list = await Faq.find({ isActive: true }).sort({ order: 1 }).lean();
    res.json(list.map((f) => ({ id: String(f._id), question: f.question, answer: f.answer })));
  } catch (err) {
    next(err);
  }
});

// GET /api/homestats — homepage countdown stats (`?section=hero|section`)
app.get('/api/homestats', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.section) filter.section = req.query.section;
    const list = await HomepageStat.find(filter).sort({ order: 1 }).lean();
    res.json(list.map((s) => ({ key: s.key, value: s.value, label: s.label, section: s.section })));
  } catch (err) {
    next(err);
  }
});

// POST /api/offers — submit an offer (guest allowed)
app.post('/api/offers', async (req, res, next) => {
  try {
    const { vehicleId, name, phone, offerPrice, message } = req.body;
    if (!vehicleId || !name || !phone || !offerPrice) {
      return res.status(400).json({ message: 'vehicleId, name, phone and offerPrice are required' });
    }
    const vehicle = await Vehicle.findOne({ id: vehicleId });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    const offer = await VehicleOffer.create({
      vehicleId,
      name,
      phone,
      offerPrice,
      askingPrice: vehicle.price,
      message
    });
    res.status(201).json(offer);
  } catch (err) {
    next(err);
  }
});

// POST /api/contacts — submit a contact/enquiry message
app.post('/api/contacts', async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'name, email and message are required' });
    }
    const contact = await ContactMessage.create({ name, email, phone: phone || '', subject: subject || '', message });
    res.status(201).json(contact);
  } catch (err) {
    next(err);
  }
});

// POST /api/test-drives — book a test drive
app.post('/api/test-drives', async (req, res, next) => {
  try {
    const { vehicleId, name, phone, preferredDate, preferredTime } = req.body;
    if (!vehicleId || !name || !phone) {
      return res.status(400).json({ message: 'vehicleId, name and phone are required' });
    }
    const vehicle = await Vehicle.findOne({ id: vehicleId });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    const testDrive = await TestDrive.create({
      vehicleId,
      vehicleLabel: `${vehicle.brand} ${vehicle.model} ${vehicle.variant || ''}`.trim(),
      name,
      phone,
      preferredDate: preferredDate || '',
      preferredTime: preferredTime || ''
    });
    res.status(201).json(testDrive);
  } catch (err) {
    next(err);
  }
});

// POST /api/sell-requests — submit a sell-your-vehicle request (guest allowed)
app.post('/api/sell-requests', async (req, res, next) => {
  try {
    const { vehicleType, brand, model, year, kilometers, fuel, transmission, name, phone, district, expectedPrice, notes } = req.body;
    if (!brand || !model || !name || !phone) {
      return res.status(400).json({ message: 'brand, model, name and phone are required' });
    }
    const request = await SellRequest.create({
      vehicleType: vehicleType === 'bike' ? 'bike' : 'car',
      brand,
      model,
      year: year ? Number(year) : null,
      kilometers: kilometers ? Number(kilometers) : null,
      fuel: fuel || '',
      transmission: transmission || '',
      name,
      phone,
      district: district || '',
      expectedPrice: expectedPrice ? Number(expectedPrice) : null,
      notes: notes || ''
    });
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
});

// Admin: dashboard summary counts
app.get('/api/admin/dashboard', adminRequired, async (_req, res, next) => {
  try {
    const [totalCars, totalBikes, pendingOffers, newContacts, pendingTestDrives, newSellRequests] = await Promise.all([
      Vehicle.countDocuments({ vehicleType: 'car' }),
      Vehicle.countDocuments({ vehicleType: 'bike' }),
      VehicleOffer.countDocuments({ status: 'Pending' }),
      ContactMessage.countDocuments({ status: 'New' }),
      TestDrive.countDocuments({ status: 'Pending' }),
      SellRequest.countDocuments({ status: 'New' })
    ]);
    res.json({ totalCars, totalBikes, totalVehicles: totalCars + totalBikes, pendingOffers, newContacts, pendingTestDrives, newSellRequests });
  } catch (err) {
    next(err);
  }
});

// Admin: offers list (latest first) with joined vehicle label
app.get('/api/admin/offers', adminRequired, async (_req, res, next) => {
  try {
    const offers = await VehicleOffer.find().sort({ createdAt: -1 }).lean();
    const ids = [...new Set(offers.map((o) => o.vehicleId).filter(Boolean))];
    const vehicles = await Vehicle.find({ id: { $in: ids } }).lean();
    const vehicleById = new Map(vehicles.map((v) => [v.id, v]));
    res.json(offers.map((o) => {
      const v = vehicleById.get(o.vehicleId);
      return {
        id: o.id,
        vehicleId: o.vehicleId,
        vehicle: v ? `${v.brand} ${v.model} ${v.variant}`.trim() : 'Vehicle',
        customer: o.name,
        phone: o.phone,
        offerPrice: o.offerPrice,
        askingPrice: o.askingPrice,
        status: o.status,
        date: o.createdAt
      };
    }));
  } catch (err) {
    next(err);
  }
});

// Admin: update offer status (Pending / Accepted / Countered / Rejected)
app.patch('/api/admin/offers/:id', adminRequired, async (req, res, next) => {
  try {
    const { status, counterPrice } = req.body;
    const query = { $or: [{ id: req.params.id }] };
    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) query.$or.push({ _id: req.params.id });
    const offer = await VehicleOffer.findOne(query);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    if (status) offer.status = status;
    if (counterPrice !== undefined) offer.counterPrice = Number(counterPrice);
    await offer.save();
    res.json(offer);
  } catch (err) {
    next(err);
  }
});

// Admin: contacts list (latest first)
app.get('/api/admin/contacts', adminRequired, async (_req, res, next) => {
  try {
    const list = await ContactMessage.find().sort({ createdAt: -1 }).lean();
    res.json(list.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      subject: c.subject,
      message: c.message,
      status: c.status,
      date: c.createdAt
    })));
  } catch (err) {
    next(err);
  }
});

// Admin: update contact status (New / Replied)
app.patch('/api/admin/contacts/:id', adminRequired, async (req, res, next) => {
  try {
    const { status } = req.body;
    const query = { $or: [{ id: req.params.id }] };
    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) query.$or.push({ _id: req.params.id });
    const contact = await ContactMessage.findOne(query);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    if (status) contact.status = status;
    await contact.save();
    res.json(contact);
  } catch (err) {
    next(err);
  }
});

// Admin: list test drives
app.get('/api/admin/test-drives', adminRequired, async (_req, res, next) => {
  try {
    const list = await TestDrive.find().sort({ createdAt: -1 }).lean();
    res.json(list.map((t) => ({
      id: t.id,
      vehicleId: t.vehicleId,
      vehicleLabel: t.vehicleLabel,
      name: t.name,
      phone: t.phone,
      preferredDate: t.preferredDate,
      preferredTime: t.preferredTime,
      status: t.status,
      note: t.note,
      date: t.createdAt
    })));
  } catch (err) {
    next(err);
  }
});

// Admin: update test drive status
app.patch('/api/admin/test-drives/:id', adminRequired, async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const query = { $or: [{ id: req.params.id }] };
    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) query.$or.push({ _id: req.params.id });
    const testDrive = await TestDrive.findOne(query);
    if (!testDrive) return res.status(404).json({ message: 'Test drive not found' });
    if (status) testDrive.status = status;
    if (note !== undefined) testDrive.note = note;
    await testDrive.save();
    res.json(testDrive);
  } catch (err) {
    next(err);
  }
});

// Admin: list sell requests (latest first)
app.get('/api/admin/sell-requests', adminRequired, async (_req, res, next) => {
  try {
    const list = await SellRequest.find().sort({ createdAt: -1 }).lean();
    res.json(list.map((r) => ({
      id: r.id,
      vehicleType: r.vehicleType,
      brand: r.brand,
      model: r.model,
      year: r.year,
      kilometers: r.kilometers,
      fuel: r.fuel,
      transmission: r.transmission,
      name: r.name,
      phone: r.phone,
      district: r.district,
      expectedPrice: r.expectedPrice,
      notes: r.notes,
      status: r.status,
      date: r.createdAt
    })));
  } catch (err) {
    next(err);
  }
});

// Admin: update sell request status (New / Contacted / Closed)
app.patch('/api/admin/sell-requests/:id', adminRequired, async (req, res, next) => {
  try {
    const { status } = req.body;
    const query = { $or: [{ id: req.params.id }] };
    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) query.$or.push({ _id: req.params.id });
    const request = await SellRequest.findOne(query);
    if (!request) return res.status(404).json({ message: 'Sell request not found' });
    if (status) request.status = status;
    await request.save();
    res.json(request);
  } catch (err) {
    next(err);
  }
});

// Admin: get settings (profile + toggles + region) — ensures defaults exist
app.get('/api/admin/settings', adminRequired, async (req, res, next) => {
  try {
    let setting = await AdminSetting.findOne({ adminId: req.adminId }).lean();
    if (!setting) {
      const admin = await Admin.findById(req.adminId).lean();
      setting = await AdminSetting.create({
        adminId: req.adminId,
        profile: { name: admin?.name || '', email: admin?.email || '', phone: '' }
      });
      setting = setting.toObject();
    }
    const admin = await Admin.findById(req.adminId).lean();
    res.json({
      profile: setting.profile || { name: admin?.name || '', email: admin?.email || '', phone: '' },
      notifications: setting.notifications instanceof Map ? Object.fromEntries(setting.notifications) : (setting.notifications || {}),
      marketplace: setting.marketplace instanceof Map ? Object.fromEntries(setting.marketplace) : (setting.marketplace || {}),
      region: setting.region || { location: 'Karnataka, India', currency: '₹ INR' },
      admin: admin ? { name: admin.name, email: admin.email } : null
    });
  } catch (err) { next(err); }
});

// Admin: patch settings (notifications / marketplace / region / profile)
app.patch('/api/admin/settings', adminRequired, async (req, res, next) => {
  try {
    const { profile, notifications, marketplace, region } = req.body || {};
    let setting = await AdminSetting.findOne({ adminId: req.adminId });
    if (!setting) {
      setting = await AdminSetting.create({ adminId: req.adminId });
    }
    if (profile) {
      if (profile.name !== undefined) setting.profile.name = String(profile.name).trim();
      if (profile.email !== undefined) setting.profile.email = String(profile.email).trim().toLowerCase();
      if (profile.phone !== undefined) setting.profile.phone = String(profile.phone).trim();
      // also sync core Admin name/email
      const admin = await Admin.findById(req.adminId);
      if (admin) {
        if (profile.name) admin.name = String(profile.name).trim();
        if (profile.email) admin.email = String(profile.email).trim().toLowerCase();
        await admin.save();
      }
    }
    if (notifications && typeof notifications === 'object') {
      for (const [k, v] of Object.entries(notifications)) setting.notifications.set(k, !!v);
    }
    if (marketplace && typeof marketplace === 'object') {
      for (const [k, v] of Object.entries(marketplace)) setting.marketplace.set(k, !!v);
    }
    if (region) {
      if (region.location !== undefined) setting.region.location = String(region.location);
      if (region.currency !== undefined) setting.region.currency = String(region.currency);
    }
    await setting.save();
    const updated = await AdminSetting.findOne({ adminId: req.adminId }).lean();
    res.json({
      profile: updated.profile,
      notifications: Object.fromEntries(updated.notifications),
      marketplace: Object.fromEntries(updated.marketplace),
      region: updated.region
    });
  } catch (err) { next(err); }
});

// Admin: change password (requires current password)
app.patch('/api/admin/password', adminRequired, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Current and new password are required.' });
    if (String(newPassword).length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    const admin = await Admin.findById(req.adminId);
    if (!admin) return res.status(404).json({ message: 'Admin not found.' });
    const ok = await admin.comparePassword(String(currentPassword));
    if (!ok) return res.status(401).json({ message: 'Current password is incorrect.' });
    admin.passwordHash = String(newPassword);
    await admin.save();
    res.json({ message: 'Password updated successfully.' });
  } catch (err) { next(err); }
});

// Admin: create a vehicle (multipart/form-data; up to 10 `images` files)
app.post('/api/admin/vehicles', adminRequired, upload.array('images', 10), async (req, res, next) => {
  try {
    const type = req.body.vehicleType === 'bike' ? 'bike' : 'car';
    if (!req.body.brand || !req.body.model || !req.body.year || !req.body.price) {
      return res
        .status(400)
        .json({ message: 'vehicleType, brand, model, year and price are required' });
    }
    const payload = buildVehiclePayload({ ...req.body, vehicleType: type });
    payload.id = req.body.id || (await nextVehicleId(type));
    if (!payload.seller) {
      payload.seller = {
        name: 'Ayra Cars Dealer',
        verified: false,
        hours: '9 AM – 7 PM',
        location: payload.district || '',
        phone: '',
        whatsapp: ''
      };
    }
    if (req.files && req.files.length > 0) {
      const urls = await Promise.all(req.files.map((f) => uploadToCloudinary(f)));
      payload.images = urls;
      payload.image = urls[0];
    }
    const vehicle = await Vehicle.create(payload);
    res.status(201).json(vehicle);
  } catch (err) {
    next(err);
  }
});

// Admin: update a vehicle (multipart/form-data; up to 10 new `images` files)
app.put('/api/admin/vehicles/:id', adminRequired, upload.array('images', 10), async (req, res, next) => {
  try {
    const query = { $or: [{ id: req.params.id }] };
    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) query.$or.push({ _id: req.params.id });
    const vehicle = await Vehicle.findOne(query);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const payload = buildVehiclePayload(req.body);
    delete payload.vehicleType; // type is an identity — not editable via admin form
    if (req.body.existingImages !== undefined || (req.files && req.files.length > 0)) {
      let kept = [];
      try {
        kept = JSON.parse(req.body.existingImages || '[]');
        if (!Array.isArray(kept)) kept = [];
      } catch {
        kept = [];
      }
      kept = kept.filter((u) => typeof u === 'string' && u.includes('res.cloudinary.com'));
      const newUrls = req.files && req.files.length > 0
        ? await Promise.all(req.files.map((f) => uploadToCloudinary(f)))
        : [];
      const nextImages = [...kept, ...newUrls].slice(0, 10);
      // delete images that were removed by the admin
      const oldImages = [vehicle.image, ...(vehicle.images || [])]
        .filter(Boolean)
        .filter((u) => !nextImages.includes(u));
      await Promise.all(oldImages.map(cleanUpload));
      payload.images = nextImages;
      payload.image = nextImages[0] || '';
    }
    Object.assign(vehicle, payload);
    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
});

// Admin: delete a vehicle
app.delete('/api/admin/vehicles/:id', adminRequired, async (req, res, next) => {
  try {
    const query = { $or: [{ id: req.params.id }] };
    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) query.$or.push({ _id: req.params.id });
    const vehicle = await Vehicle.findOne(query);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    await Promise.all(
      [vehicle.image, ...(vehicle.images || [])].filter(Boolean).map(cleanUpload)
    );
    await vehicle.deleteOne();
    res.json({ message: 'Vehicle deleted', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

// Central error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Ayra Cars API listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });