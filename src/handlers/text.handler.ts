import { get } from 'lodash';
import { User } from '../models/user.model';
import { sendMessageHelper, updateBack, updateStep, updateUser } from '../utils/helper';
import { userBtn, option, adminBtn } from '../keyboards/keyboards';
import i18n from '../utils/i18n';
import { buildKeyboard } from '../keyboards/inline.keyboards';
import { Contact } from '../models/contact.model';
import { Coupon } from '../models/coupon.model';
import * as dotenv from 'dotenv';
import escapeHTML from '../utils/escape-html';
import type { BotContext } from '../types/bot.types';
import type { Message, SendLocationOptions } from 'node-telegram-bot-api';
import type { IUser } from '../types/user.types';

dotenv.config();

export const textHandlers: Record<
  string,
  {
    middleware: (ctx: BotContext) => Promise<boolean> | boolean;
    selfExecuteFn?: (ctx: BotContext) => Promise<void>;
  }
> = {
  '3': {
    middleware: ({ user }: BotContext): boolean => {
      return get(user, 'user_step') === 3;
    },
    selfExecuteFn: async ({ chat_id, msgText }: BotContext): Promise<void> => {
      await User.findOneAndUpdate({ chat_id }, { fullName: msgText });

      await sendMessageHelper(chat_id, i18n.__('messages.enter_phone'), {
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
      });

      await updateStep(chat_id, 4);
    },
  },
  '11': {
    middleware: ({ user }: BotContext): boolean => {
      return get(user, 'user_step') === 11;
    },
    selfExecuteFn: async ({ chat_id, msgText, user, bot }: BotContext): Promise<void> => {
      const deleteMessage: Message = await sendMessageHelper(chat_id, i18n.__('messages.loading'));
      const GROUP_CHAT_ID = process.env.GROUP_CHAT_ID;

      function escapeRegex(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }

      const couponCode: string = msgText.trim().toLowerCase();
      const safeCode = escapeRegex(couponCode);

      const coupon = await Coupon.findOne({
        code: { $regex: new RegExp(`^${safeCode}$`, 'i') },
        userId: null,
      }).populate('branchId', 'name address');

      if (!coupon) {
        await bot.deleteMessage(chat_id, deleteMessage.message_id);
        await sendMessageHelper(chat_id, i18n.__('messages.coupon_not_found'));
        return;
      }

      coupon.userId = user._id;
      coupon.activatedAt = new Date();
      await coupon.save();

      await Promise.all([
        User.findOneAndUpdate(
          { _id: user._id },
          {
            $push: {
              coupons: {
                code: coupon.code,
                coupon: coupon._id,
                activatedAt: coupon.activatedAt,
                branchId: get(user, 'select.selectBranchId'),
              },
            },
          },
        ),
        updateStep(chat_id, 12),
      ]);

      const message = i18n.__('messages.coupon_success', { coupon: coupon.code });
      await bot.deleteMessage(chat_id, deleteMessage.message_id);
      await sendMessageHelper(chat_id, message);

      if (GROUP_CHAT_ID) {
        try {
          const infoMessage = `
🍀 <b>Kupon aktivlashtirildi!</b>

👤 <b>Foydalanuvchi:</b> ${escapeHTML(user.fullName) || 'Noma’lum'}
📞 <b>Telefon:</b> ${escapeHTML(user.phone) || '—'}
🕒 <b>Aktivlashtirilgan sana:</b> ${escapeHTML(coupon.activatedAt.toLocaleString('uz-UZ'))}

💳 <b>Kupon kodi:</b> #${escapeHTML(coupon.code)}
`;

          await bot.sendMessage(GROUP_CHAT_ID, infoMessage, {
            parse_mode: 'HTML',
          });
        } catch (err) {
          console.error('Failed to send group notification:', err);
          if (process.env.PERSONAL_CHAT_ID) {
            await bot.sendMessage(
              process.env.PERSONAL_CHAT_ID,
              `⚠️ Group notification error: ${String(err)}`,
            );
          }
        }
      }
    },
  },

  '4': {
    middleware: ({ user }: BotContext): boolean => {
      return get(user, 'user_step') === 4;
    },
    selfExecuteFn: async ({ chat_id, msgText, user }: BotContext): Promise<void> => {
      const regex = /^[0-9]{9}$/;

      if (regex.test(msgText)) {
        const phone = '998' + msgText;

        await User.findOneAndUpdate(
          { chat_id },
          {
            phone,
            fullName: get(user, 'fullName', ''),
            language: get(user, 'language', '').toLowerCase(),
          },
        );

        await sendMessageHelper(chat_id, i18n.__('messages.login_success'), userBtn());
        await updateStep(chat_id, 10);
      } else {
        await sendMessageHelper(chat_id, i18n.__('messages.phone_invalid'), option);
      }
    },
  },

  '16': {
    selfExecuteFn: async ({ chat_id, msgText, bot }: BotContext): Promise<void> => {
      const regex = /^[0-9]{9}$/;

      if (regex.test(msgText)) {
        const deleteMessage = await sendMessageHelper(chat_id, i18n.__('messages.loading'));

        await User.findOneAndUpdate({ chat_id: chat_id }, { phone: msgText });
        await bot.deleteMessage(chat_id, deleteMessage.message_id);
        await sendMessageHelper(chat_id, i18n.__('messages.phone_changed_done'));
      } else {
        await sendMessageHelper(chat_id, i18n.__('messages.phone_invalid'));
        return;
      }
    },
    middleware: ({ user }: BotContext): boolean => {
      return get(user, 'user_step') === 16;
    },
  },

  '17': {
    selfExecuteFn: async ({ chat_id, msgText, bot }: BotContext): Promise<void> => {
      const deleteMessage: Message = await sendMessageHelper(chat_id, i18n.__('messages.loading'));
      try {
        await User.findOneAndUpdate({ chat_id: chat_id }, { fullName: msgText });
        await bot.deleteMessage(chat_id, deleteMessage.message_id);

        await sendMessageHelper(chat_id, i18n.__('messages.name_changed_done'));
      } catch (_e) {
        await bot.deleteMessage(chat_id, deleteMessage.message_id);
        await sendMessageHelper(chat_id, i18n.__('messages.error'));
      }
    },
    middleware: ({ user }: BotContext): boolean => {
      return get(user, 'user_step') === 17;
    },
  },

  '59': {
    selfExecuteFn: async ({ chat_id, msgText, user }: BotContext): Promise<void> => {
      await sendMessageHelper(chat_id, 'Addresni kiriting', buildKeyboard());
      await updateBack(chat_id, { text: 'Nomini yozing', btn: buildKeyboard(), step: 59 });
      await updateUser(chat_id, {
        select: { ...get(user, 'select', {}), branchName: msgText },
        user_step: 60,
      });
    },
    middleware: ({ user }: BotContext): boolean => {
      return get(user, 'user_step') === 59 && get(user, 'admin') === true;
    },
  },
  '60': {
    selfExecuteFn: async ({ chat_id, msgText, user }: BotContext): Promise<void> => {
      await sendMessageHelper(chat_id, 'Telefon raqam kiriting', buildKeyboard());
      await updateBack(chat_id, { text: 'Addressni yozing', btn: buildKeyboard(), step: 60 });

      await updateUser(chat_id, {
        select: { ...get(user, 'select', {}), branchAddress: msgText },
        user_step: 61,
      });
    },
    middleware: ({ user }: BotContext): boolean => {
      return get(user, 'user_step') === 60 && get(user, 'admin') === true;
    },
  },
  '61': {
    selfExecuteFn: async ({ chat_id, msgText, user }: BotContext): Promise<void> => {
      await sendMessageHelper(chat_id, 'Ish vaqtini yozing', buildKeyboard());
      await updateBack(chat_id, { text: 'Telefon raqam kiriting', btn: buildKeyboard(), step: 61 });

      await updateUser(chat_id, {
        select: { ...get(user, 'select', {}), branchPhone: msgText },
        user_step: 62,
      });
    },
    middleware: ({ user }: BotContext): boolean => {
      return get(user, 'user_step') === 61 && get(user, 'admin') === true;
    },
  },
  '62': {
    selfExecuteFn: async ({ chat_id, msgText, user }: BotContext): Promise<void> => {
      const btn: SendLocationOptions = {
        reply_markup: {
          resize_keyboard: true,
          keyboard: [
            [
              {
                text: "Locatsiya jo'natish",
                request_location: true,
              },
            ],
            [
              {
                text: '⬅️ Orqaga',
              },
            ],
          ],
        },
      };
      await sendMessageHelper(chat_id, `Locatsiya jo'nating`, btn);
      await updateBack(chat_id, { text: 'Ish vaqtini yozing', btn: buildKeyboard(), step: 62 });
      await updateUser(chat_id, {
        select: { ...get(user, 'select', {}), branchTime: msgText },
        user_step: 63,
      });
    },
    middleware: ({ user }: BotContext): boolean => {
      return get(user, 'user_step') === 62 && get(user, 'admin') === true;
    },
  },
  '70': {
    selfExecuteFn: async ({ chat_id, msgText }: BotContext): Promise<void> => {
      await Contact.findOneAndUpdate({}, { $set: { text: msgText } });
      await sendMessageHelper(chat_id, "Muvaffaqiyatli o'zgartirildi", adminBtn);
      await updateStep(chat_id, 10);
    },
    middleware: ({ user }: BotContext): boolean => {
      return get(user, 'user_step') === 70;
    },
  },

  '30': {
    selfExecuteFn: async ({ chat_id, msgText }: BotContext): Promise<void> => {
      const coupon = await Coupon.findOneAndDelete({
        code: new RegExp(`^${msgText}$`, 'i'),
      });

      if (!coupon) {
        await sendMessageHelper(chat_id, '❌ Bunday kupon topilmadi.');
        return;
      }

      await User.updateMany(
        { 'coupons.coupon': coupon._id },
        { $pull: { coupons: { coupon: coupon._id } } },
      );

      await sendMessageHelper(chat_id, `✅ Kupon ${coupon.code} o‘chirildi`);
    },
    middleware: ({ user }: BotContext): boolean => get(user, 'user_step') === 30,
  },

  '90': {
    selfExecuteFn: async ({ chat_id, msgText }: BotContext): Promise<void> => {
      const coupon = await Coupon.findOne({
        code: { $regex: new RegExp(`^${msgText}$`, 'i') },
      }).populate<{ userId: IUser }>('userId');
      if (!coupon) {
        await sendMessageHelper(chat_id, '❌ Kupon topilmadi.');
        return;
      }

      if (coupon.wonAt) {
        await sendMessageHelper(chat_id, '⚠️ Bu kupon allaqachon yutgan deb belgilangan.');
        return;
      }

      const userInfo = `
👤 Foydalanuvchi: ${coupon.userId.fullName || '-'}
📞 Telefon: ${coupon.userId.phone ?? '-'}
💬 Chat ID: ${coupon.userId.chat_id}
Language : ${coupon.userId.language || '-'}
`;

      await sendMessageHelper(
        chat_id,
        `🎉 Kupon ${coupon.code} uchun yutuq textini yuboring.\n\n${userInfo}`,
      );
      await updateUser(chat_id, {
        user_step: 91,
        select: { couponId: coupon._id, winnerId: coupon.userId._id },
      });
    },
    middleware: ({ user }: BotContext): boolean => get(user, 'user_step') === 90,
  },
};
