import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Coupon } from '../models/coupon.model';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your_db_name';

const filePath = path.join(__dirname, '../data/coupons.txt');
const fileContent = fs.readFileSync(filePath, 'utf-8');
const mockCodes = fileContent
  .split(/\r?\n/)
  .map((c) => c.trim())
  .filter(Boolean);

async function seedCoupons(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    const normalizedCodes = mockCodes.map((c) => c.toUpperCase());

    const existing = await Coupon.find({ code: { $in: normalizedCodes } })
      .collation({ locale: 'en', strength: 2 })
      .select('code -_id')
      .lean();

    const existingCodes = new Set(existing.map((e) => e.code.toUpperCase()));
    const newCodes = normalizedCodes.filter((c) => !existingCodes.has(c));

    if (newCodes.length > 0) {
      const docs = newCodes.map((code) => ({
        code,
        description: 'Mock coupon',
        smsSent: false,
      }));
      await Coupon.insertMany(docs);
    }

    console.log(`📊 Inserted: ${newCodes.length}, Skipped: ${existingCodes.size}`);
  } catch (err) {
    console.error('❌ Error seeding coupons:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

void seedCoupons();
