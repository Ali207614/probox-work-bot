import i18n from '../utils/i18n';
import type { IMenuOptions } from '../types/keyboards.types';

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

export const userBtn = (): IMenuOptions => {
  return {
    parse_mode: 'Markdown',
    reply_markup: {
      resize_keyboard: true,
      keyboard: [
        [{ text: i18n.__('menu.my_coupons') }, { text: i18n.__('menu.activate_coupon') }],
        [{ text: i18n.__('menu.branches') }, { text: i18n.__('menu.contact') }],
        [{ text: i18n.__('menu.settings') }],
      ],
    },
  };
};
