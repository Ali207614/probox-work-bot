import type { Types } from 'mongoose';
import type { Document } from 'node-telegram-bot-api';
import type { IMenuOptions } from './keyboards.types';

export interface ISelect {
  pagination?: { prev: number; next: number };
  update?: boolean;
  branchLat?: number;
  branchLong?: number;
  branchName?: string;
  branchAddress?: string;
  branchPhone?: string;
  branchTime?: string;
  branchImage?: { file_id: string }[];
  updateBranchId?: number;
  selectBranchId?: Types.ObjectId | undefined;
  branchesList?: {
    branchId: number;
    address: string;
    location: { lat: number; lng: number };
    name: string;
    supportPhone: string;
    workingHours: string;
    image: { file_id: string }[];
  }[];
}

export interface IBack {
  step: number;
  text: string;
  btn: IMenuOptions | Record<string, any>;
  setting?: boolean;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName: string;
  chat_id: number;
  language: string;
  user_step: number;
  back: IBack[];
  select: ISelect;
  phone?: string;
  admin?: boolean;
  status?: boolean;
  lastMessageId?: number;

  // SLP (menejer)
  slpCode?: number | null;
  slpName?: string | null;
  slpRole?: string | null;
  slpBranch?: string | null;

  createdAt: Date;
  updatedAt: Date;
}
