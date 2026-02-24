import { Schema, model, Document } from 'mongoose';

export interface IBranch {
  branchId: number;
  address: string;
  location: { lat: number; lng: number };
  name: string;
  supportPhone: string;
  workingHours: string;
  image: { file_id: string }[];
}

export interface IBranchDocument extends IBranch, Document {}

export type IBranchWithDistance = IBranch & { distance: number };

const branchSchema = new Schema<IBranchDocument>(
  {
    branchId: { type: Number, required: true, unique: true },
    address: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    name: { type: String, required: true },
    supportPhone: { type: String, required: false },
    workingHours: { type: String },
    image: [
      {
        file_id: { type: String, required: true },
      },
    ],
  },
  { timestamps: true },
);

export const Branch = model<IBranchDocument>('Branch', branchSchema);
