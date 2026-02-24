import { get } from 'lodash';
import type TelegramBot from 'node-telegram-bot-api';
import { config } from '../config';
import { User } from '../models/user.model';
import type { IBack, IUser } from '../types/user.types';
import { Coupon } from '../models/coupon.model';
import type { QueryFilter } from 'mongoose';

export async function infoUser({ chat_id }: { chat_id: number }): Promise<IUser | null> {
  return User.findOne({ chat_id });
}

export async function updateBack(
  chat_id: number,
  userData: IBack,
  setting: boolean = false,
): Promise<void> {
  await User.updateOne({ chat_id }, { $push: { back: { ...userData, setting } } });
}

export async function updateStep(chat_id: number, user_step = 1): Promise<void> {
  await User.updateOne({ chat_id }, { $set: { user_step } });
}

export async function searchUsersAll(query: string): Promise<IUser[]> {
  const regex = new RegExp(query, 'i');

  const coupon = await Coupon.findOne({ code: regex });

  const filter: QueryFilter<IUser> = {
    $or: [{ fullName: regex }, { phone: regex }],
  };

  if (coupon) {
    (filter.$or as any[]).push({ 'coupons.coupon': coupon._id });
  }

  return User.find(filter).populate('coupons.coupon').lean<IUser[]>();
}

export async function updateUser(chat_id: number, userData: Partial<IUser>): Promise<void> {
  await User.updateOne({ chat_id }, { $set: userData });
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function sendMessageHelper(
  chat_id: number,
  text: string,
  options?: TelegramBot.SendMessageOptions,
  file?: { document: { file_id: string } },
): Promise<TelegramBot.Message> {
  if (file) {
    return config.bot.sendDocument(chat_id, get(file, 'document.file_id'), {
      caption: text,
      reply_markup: options?.reply_markup,
    });
  }
  return config.bot.sendMessage(chat_id, text, options);
}

export const sleepNow = (delay: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};
