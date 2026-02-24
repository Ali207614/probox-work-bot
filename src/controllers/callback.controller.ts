import type { CallbackQuery } from 'node-telegram-bot-api';
import type TelegramBot from 'node-telegram-bot-api';
import { get } from 'lodash';
import { callbackHandlers } from '../handlers/callback.handler';
import { infoUser } from '../utils/helper';
import i18n from '../utils/i18n';
import type { BotContext } from '../types/bot.types';
import type { IUser } from '../types/user.types';

export class CallbackController {
  async handle(
    bot: TelegramBot,
    query: CallbackQuery,
    chat_id: number,
    data: string[],
  ): Promise<void> {
    try {
      const user: IUser | null = await infoUser({ chat_id });
      if (user) {
        i18n.setLocale(get(user, 'language', 'uz'));
      }

      const key: string | undefined = data[0];
      const handler = callbackHandlers[key ?? ''];

      if (!handler) {
        await bot.sendMessage(chat_id, i18n.__('messages.not_found'));
        return;
      }

      const ctx: BotContext & { data: string[] } = {
        bot,
        chat_id,
        msg: query.message!,
        msgText: query.data ?? '',
        user: user!,
        data,
      };

      const allowed: boolean = await handler.middleware(ctx);
      if (!allowed) {
        return;
      }

      if (handler.selfExecuteFn) {
        await handler.selfExecuteFn(ctx);
      }
    } catch (err) {
      console.error('CallbackController error:', err);
      await bot.sendMessage(chat_id, i18n.__('messages.error_occurred'));
    }
  }
}
