// Ayra Cars admin seeder
// Usage: node src/seed/seed.js
const mongoose = require('mongoose');
require('dotenv').config();

const { SEED_ADMIN } = require('./data/admin.data');
const Admin = require('../models/admin.model');
const Brand = require('../models/brand.model');

// Default brand master — upserted so vehicle dropdowns/filters are never empty.
const DEFAULT_BRANDS = [
  { name: 'Maruti Suzuki', type: 'car' },
  { name: 'Hyundai', type: 'car' },
  { name: 'Tata', type: 'car' },
  { name: 'Mahindra', type: 'car' },
  { name: 'Toyota', type: 'car' },
  { name: 'Kia', type: 'car' },
  { name: 'Honda', type: 'both' },
  { name: 'Skoda', type: 'car' },
  { name: 'Volkswagen', type: 'car' },
  { name: 'MG', type: 'car' },
  { name: 'Jeep', type: 'car' },
  { name: 'Renault', type: 'car' },
  { name: 'Nissan', type: 'car' },
  { name: 'Ford', type: 'car' },
  { name: 'BMW', type: 'car' },
  { name: 'Mercedes-Benz', type: 'car' },
  { name: 'Audi', type: 'car' },
  { name: 'Royal Enfield', type: 'bike' },
  { name: 'KTM', type: 'bike' },
  { name: 'Yamaha', type: 'bike' },
  { name: 'Bajaj', type: 'bike' },
  { name: 'TVS', type: 'bike' },
  { name: 'Hero', type: 'bike' },
  { name: 'Suzuki', type: 'bike' },
  { name: 'Kawasaki', type: 'bike' },
  { name: 'Triumph', type: 'bike' },
  { name: 'Jawa', type: 'bike' },
  { name: 'Vespa', type: 'bike' },
  { name: 'Ola', type: 'bike' },
  { name: 'Ather', type: 'bike' }
];

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayracars';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log('Connected to MongoDB:', mongoose.connection.name);

  const admin = await Admin.findOne({ email: SEED_ADMIN.email });
  if (admin) {
    admin.name = SEED_ADMIN.name;
    admin.passwordHash = SEED_ADMIN.password;
    admin.role = SEED_ADMIN.role;
    await admin.save();
    console.log(`Updated admin (${SEED_ADMIN.email})`);
  } else {
    const doc = new Admin({ ...SEED_ADMIN, passwordHash: SEED_ADMIN.password });
    await doc.save();
    console.log(`Created admin (${SEED_ADMIN.email} / ${SEED_ADMIN.password})`);
  }

  await seedBrands();

  await mongoose.disconnect();
  console.log('Seeding complete. MongoDB disconnected.');
}

async function seedBrands() {
  let added = 0;
  for (const b of DEFAULT_BRANDS) {
    const res = await Brand.updateOne(
      { name: new RegExp(`^${b.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      { $setOnInsert: { name: b.name, type: b.type, code: '', color: '#2563eb', logo: '' } },
      { upsert: true }
    );
    if (res.upsertedCount) added++;
  }
  console.log(`Brand master ready (${added} new, ${DEFAULT_BRANDS.length} total in list).`);
}

if (require.main === module) {
  seed().catch((err) => {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  });
}

module.exports = { seed };
