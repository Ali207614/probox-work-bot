import i18n from '../utils/i18n';
import type { IMenuOptions } from '../types/keyboards.types';
import type { SendMessageOptions } from 'node-telegram-bot-api';

export const mainMenuUz: SendMessageOptions = {
  reply_markup: {
    resize_keyboard: true,
    keyboard: [[{ text: '📊 Umumiy hisobot' }]],
  },
};

export const mainMenuRu: SendMessageOptions = {
  reply_markup: {
    resize_keyboard: true,
    keyboard: [[{ text: '📊 Общий отчет' }], [{ text: '⬅️ Назад' }]],
  },
};

/**
 * lang: 'uz' | 'ru' (sizda boshqa bo'lsa ham ishlaydi)
 * - null/undefined bo'lsa default: uz
 */
export function mainMenuByLang(lang?: string): SendMessageOptions {
  const l = String(lang ?? '').toLowerCase();

  if (l === 'ru' || l === 'rus' || l === 'russian') {
    return mainMenuRu;
  }

  // default
  return mainMenuUz;
}

export function userBtn(): SendMessageOptions {
  return {
    reply_markup: {
      resize_keyboard: true,
      keyboard: [[{ text: '📊 Umumiy hisobot' }]],
    },
  };
}

export const option: IMenuOptions = {
  parse_mode: 'Markdown',
  reply_markup: {
    resize_keyboard: true,
    keyboard: [
      [
        {
          text: i18n.__('messages.enter_phone_btn'),
          request_contact: true,
        },
      ],
    ],
  },
};

export const adminBtn: IMenuOptions = {
  parse_mode: 'Markdown',
  reply_markup: {
    resize_keyboard: true,
    keyboard: [
      [{ text: 'Filiallar' }, { text: "Biz bilan bo'glanish nomer" }],
      [{ text: 'Couponlar' }, { text: 'Foydalanuvchilar qidirish' }, { text: 'Coupon yutuq' }],
      [{ text: 'Foydalanuvchilar excel' }],
    ],
  },
};
