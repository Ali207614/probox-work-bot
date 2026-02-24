import { Message } from 'node-telegram-bot-api';
import TelegramBot from 'node-telegram-bot-api';
import { get } from 'lodash';
import { User } from '../models/user.model';
import { sendMessageHelper, updateStep } from '../utils/helper';
import { option, userBtn } from '../keyboards/keyboards';
import i18n from '../utils/i18n';


export class ContactController {
  async handle(bot: TelegramBot, msg: Message, chat_id: number): Promise<void> {
    try {
      const user = await User.findOne({ chat_id });

      if (!user) {
        await bot.sendMessage(chat_id, i18n.__('messages.error'));
        return;
      }

      const phoneNumber = get(msg, 'contact.phone_number', '').replace(/\D/g, '');
      if (!phoneNumber) {
        await sendMessageHelper(chat_id, i18n.__('messages.phone_invalid'), option);
        return;
      }

      if (!get(user, 'phone')) {
        const deleteMessage = await sendMessageHelper(chat_id, i18n.__('messages.loading'));

        await User.findOneAndUpdate(
          { chat_id },
          {
            phone: phoneNumber,
            fullName: get(user, 'fullName', ''),
            language: get(user, 'language', '').toLowerCase(),
          },
        );

        await bot.deleteMessage(chat_id, deleteMessage.message_id);

        await sendMessageHelper(chat_id, i18n.__('messages.login_success'), userBtn());
        await updateStep(chat_id, 10);
        return;
      }

      await User.findOneAndUpdate({ chat_id }, { phone: phoneNumber });

      await sendMessageHelper(chat_id, i18n.__('messages.phone_changed_done'));
    } catch (err) {
      console.error('ContactController error:', err);
      await sendMessageHelper(chat_id, i18n.__('messages.error'));
    }
  }
}
