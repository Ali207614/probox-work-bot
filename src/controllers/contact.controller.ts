import type { Message } from 'node-telegram-bot-api';
import type TelegramBot from 'node-telegram-bot-api';
import { User } from '../models/user.model';
import { sendMessageHelper, updateStep } from '../utils/helper';
import { mainMenuUz, option } from '../keyboards/keyboards';
import { HanaService } from '../sap/hana.service';
import i18n from '../utils/i18n';
import { SapService } from '../sap/sap-hana.service';

export class ContactController {
  private readonly sapService: SapService;

  constructor() {
    this.sapService = new SapService(new HanaService());
  }

  async handle(bot: TelegramBot, msg: Message, chatId: number): Promise<void> {
    try {
      const phone = msg.contact?.phone_number?.replace(/\D/g, '');

      if (!phone) {
        await sendMessageHelper(chatId, i18n.__('messages.phone_invalid'), option);
        return;
      }

      const loadingMsg = await sendMessageHelper(chatId, i18n.__('messages.loading'));

      // SAP dan menejer tekshirish
      const slp = await this.sapService.getSlpByPhone(phone);

      if (!slp) {
        await bot.deleteMessage(chatId, loadingMsg.message_id);
        await sendMessageHelper(chatId, i18n.__('messages.slp_not_found'), option);
        return;
      }

      // User yaratish yoki yangilash (upsert)
      await User.findOneAndUpdate(
        { chat_id: chatId },
        {
          chat_id: chatId,
          phone,
          fullName: slp.SlpName,
          language: 'uz',
          slpCode: slp.SlpCode,
          slpName: slp.SlpName,
          slpRole: slp.U_role,
          slpBranch: slp.U_branch,
          status: true,
        },
        { upsert: true, new: true },
      );

      await bot.deleteMessage(chatId, loadingMsg.message_id);
      await sendMessageHelper(chatId, i18n.__('messages.login_success'), mainMenuUz);
      await updateStep(chatId, 10);
    } catch (err) {
      console.error('ContactController error:', err);
      await sendMessageHelper(chatId, i18n.__('messages.error'));
    }
  }
}
