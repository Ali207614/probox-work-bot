import { get } from 'lodash';
import { Message } from 'node-telegram-bot-api';
import { User } from '../models/user.model';
import { sendMessageHelper, updateStep, updateUser } from '../utils/helper';
import { buildKeyboard } from '../keyboards/inline.keyboards';
import i18n from '../utils/i18n';
import { BotContextWithData } from '../types/bot.types';
import { Branch, IBranch } from '../models/branch.model';
import { IUser } from '../types/user.types';
import { Coupon } from '../models/coupon.model';

export const callbackHandlers: Record<
  string,
  {
    middleware: (ctx: BotContextWithData) => Promise<boolean> | boolean;
    selfExecuteFn?: (ctx: BotContextWithData) => Promise<void>;
  }
> = {
  cancelWin: {
    selfExecuteFn: async ({ chat_id, bot, msg }: BotContextWithData): Promise<void> => {
      const messageId = get(msg, 'message_id');
      if (messageId) {
        await bot.deleteMessage(chat_id, messageId).catch(() => null);
      }

      await sendMessageHelper(chat_id, '❌ Bekor qilindi. SMS yuborilmadi.');

      await updateUser(chat_id, { user_step: 0, select: {} });
    },
    middleware: ({ user }: BotContextWithData): boolean => get(user, 'user_step') === 91,
  },
};
