import { Schema, model, type Document, type Model } from 'mongoose';

export interface IBranch extends Document {
  id: number;
  code: string;
  name: string;
  region?: string;
  address?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<IBranch>(
  {
    id: { type: Number, required: true },
    code: { type: String, required: true },
    name: {
      type: String,
      required: true,
      trim: true,
      // description: mongoose uchun real option emas, shuning uchun olib tashladim
    },
    region: { type: String, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  { timestamps: true },
);

export const Branch: Model<IBranch> = model<IBranch>('Branch', BranchSchema);
export { BranchSchema };
