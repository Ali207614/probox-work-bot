import { Document, Types } from 'mongoose';

export interface ICoupon extends Document {
  branchId: Types.ObjectId;
  code: string;
  startDate: Date | null;
  endDate: Date | null;
  userId?: Types.ObjectId | null;
  activatedAt?: Date | null;
  description?: string;
  wonAt?: Date | null;
  wonText?: string | null;
  smsSent?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
