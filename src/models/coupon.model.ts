import { Schema, model } from 'mongoose';
import type { ICoupon } from '../types/coupon.types';

const couponSchema = new Schema<ICoupon>(
  {
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: false },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    startDate: { type: Date },
    endDate: { type: Date },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    activatedAt: { type: Date, default: null },
    description: { type: String },

    wonAt: { type: Date, default: null },
    wonText: { type: String, default: null },
    smsSent: { type: Boolean, default: false },
  },
  { timestamps: true },
);

couponSchema.index({ userId: 1 });
couponSchema.index({ branchId: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });

export const Coupon = model<ICoupon>('Coupon', couponSchema);
