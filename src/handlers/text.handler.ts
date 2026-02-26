import { get } from 'lodash';
import { User } from '../models/user.model';
import { sendMessageHelper, updateBack, updateStep, updateUser } from '../utils/helper';
import { userBtn, option } from '../keyboards/keyboards';
import i18n from '../utils/i18n';
import { buildKeyboard } from '../keyboards/inline.keyboards';
import * as dotenv from 'dotenv';
import type { BotContext } from '../types/bot.types';
import type { Message, SendLocationOptions } from 'node-telegram-bot-api';

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
};
