import { Types } from 'mongoose';
import {Document} from "node-telegram-bot-api";
import {IMenuOptions} from "./keyboards.types";

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
  couponBranchId?: number;
  couponCode?: string;
  couponStartDate?: Date;
  couponEndDate?: Date;
  couponUserId?: number;
  couponId?: Types.ObjectId | undefined;
  winnerId?: Types.ObjectId;
  winnerText?: string;
  smsSent?: boolean;
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
  coupons?: {
    code: string;
    coupon: Types.ObjectId;
    activatedAt: Date;
    branchId: Types.ObjectId;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
