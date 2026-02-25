import { get } from 'lodash';
import i18n from '../utils/i18n';
import { User } from '../models/user.model';
import type { Message } from 'node-telegram-bot-api';
import type TelegramBot from 'node-telegram-bot-api';
import { sendMessageHelper, updateStep, updateUser } from '../utils/helper';
import { adminBtn, userBtn } from '../keyboards/keyboards';
import type { BotContext, ButtonAction } from '../types/bot.types';
import { handlerRegistry, findHandler } from '../handlers/handler.registry';
import type { IUser } from '../types/user.types';

export class TextController {
  async handle(bot: TelegramBot, msg: Message, chat_id: number): Promise<void> {
    try {
      const user: IUser | null = await User.findOne({ chat_id });

      if (user) {
        i18n.setLocale(get(user, 'language', 'uz'));
      }
      else{
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
          return;
      }

      const msgText: string = msg.text ?? '';


      // ⏱️ 3. Dynamic/static button handler
      const btnAction: ButtonAction | undefined = findHandler(msgText);

      if (
        btnAction &&
        (await btnAction.middleware?.({ bot, chat_id, msgText, msg, user } as BotContext))
      ) {
        await btnAction.selfExecuteFn?.({ bot, chat_id, msgText, msg, user } as BotContext);

        return;
      }

      // ⏱️ 4. Step handler
      const stepKey: string = get(user, 'user_step', '1').toString();
      const stepAction: ButtonAction | undefined = handlerRegistry[stepKey];

      if (
        stepAction &&
        (await stepAction.middleware?.({ bot, chat_id, msgText, msg, user } as BotContext))
      ) {
        await stepAction.selfExecuteFn?.({ bot, chat_id, msgText, msg, user } as BotContext);

        return;
      }
    } catch (err) {
      console.error('TextController.handle error:', err);
    }
  }

  private async handleStart(ctx: BotContext): Promise<void> {
    const { chat_id, user } = ctx;

    if (!get(user, 'phone')) {
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
      return;
    }

    await updateUser(chat_id, { user_step: 10, back: [], select: {} });
    await sendMessageHelper(
      chat_id,
      i18n.__('messages.start'),
      get(user, 'admin') ? adminBtn : userBtn(),
    );
  }
}
