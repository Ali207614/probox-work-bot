import { Branch, type IBranch } from '../models/branch.model';
import { sendMessageHelper, updateBack, updateStep, updateUser } from '../utils/helper';
import { buildKeyboard } from '../keyboards/inline.keyboards';
import { adminBtn, userBtn } from '../keyboards/keyboards';
import i18n from '../utils/i18n';
import type { BotContext } from '../types/bot.types';
import type { SendMessageOptions } from 'node-telegram-bot-api';
import { get } from 'lodash';

export const stepHandlers: Record<
  string,
  {
    middleware: (ctx: BotContext) => boolean | Promise<boolean>;
    selfExecuteFn?: (ctx: BotContext) => Promise<void>;
  }
> = {
  '🏢 Filiallar': {
    middleware: (): boolean => true,
    selfExecuteFn: async ({ chat_id }: BotContext): Promise<void> => {
      const branches: IBranch[] = await Branch.find();

      if (!branches?.length) {
        await sendMessageHelper(chat_id, i18n.__('messages.location_not_available'));
        return;
      }

      if (branches.length) {
        await updateBack(chat_id, {
          text: i18n.__('messages.start'),
          btn: userBtn(),
          step: 10,
        });

        const btn: SendMessageOptions = buildKeyboard(
          branches.map((item: IBranch) => item.name),
          2,
          true,
          true,
        );

        await sendMessageHelper(chat_id, i18n.__('messages.branch_list_text'), btn);
        return;
      }

      await sendMessageHelper(chat_id, i18n.__('messages.location_not_available'));
    },
  },
  '🏢 Филиалы': {
    middleware: (): boolean => true,
    selfExecuteFn: async ({ chat_id }: BotContext): Promise<void> => {
      const branches: IBranch[] = await Branch.find();

      if (!branches) {
        await sendMessageHelper(chat_id, i18n.__('messages.location_not_available'));
        return;
      }

      if (branches.length) {
        await updateBack(chat_id, {
          text: i18n.__('messages.start'),
          btn: userBtn(),
          step: 10,
        });

        const btn = buildKeyboard(
          branches.map((item: IBranch) => item.name),
          2,
          true,
          true,
        );

        await sendMessageHelper(chat_id, i18n.__('messages.branch_list_text'), btn);
        return;
      }

      await sendMessageHelper(chat_id, i18n.__('messages.location_not_available'));
    },
  },

  '✨ Активировать купон': {
    selfExecuteFn: async ({ chat_id }: BotContext): Promise<void> => {
      const branches: IBranch[] = await Branch.find().lean();

      if (!branches?.length) {
        await sendMessageHelper(chat_id, i18n.__('messages.location_not_available'));
        return;
      }

      if (branches.length) {
        const btn: SendMessageOptions = buildKeyboard(
          branches.map((item: IBranch) => item.name),
          2,
        );

        await sendMessageHelper(chat_id, i18n.__('messages.choose_branch_activated_coupon'), btn);

        await Promise.all([
          updateBack(chat_id, {
            text: i18n.__('messages.start'),
            btn: userBtn(),
            step: 10,
          }),
          updateUser(chat_id, {
            user_step: 111,
          }),
        ]);
        return;
      }

      await sendMessageHelper(chat_id, i18n.__('messages.location_not_available'));
    },
    middleware: ({ user }: BotContext): boolean => {
      return get(user, 'user_step') !== 11;
    },
  },
  '✨ Kuponni faollashtirish': {
    selfExecuteFn: async ({ chat_id }: BotContext): Promise<void> => {
      const branches: IBranch[] = await Branch.find().lean();

      if (!branches?.length) {
        await sendMessageHelper(chat_id, i18n.__('messages.location_not_available'));
        return;
      }

      if (branches.length) {
        const btn: SendMessageOptions = buildKeyboard(
          branches.map((item: IBranch) => item.name),
          2,
        );
        await sendMessageHelper(chat_id, i18n.__('messages.choose_branch_activated_coupon'), btn);

        await Promise.all([
          updateBack(chat_id, {
            text: i18n.__('messages.start'),
            btn: userBtn(),
            step: 10,
          }),
          updateUser(chat_id, {
            user_step: 111,
          }),
        ]);
        return;
      }

      await sendMessageHelper(chat_id, i18n.__('messages.location_not_available'));
    },
    middleware: ({ user }: BotContext): boolean => {
      return get(user, 'user_step') !== 11;
    },
  },

  '⬅️ Назад': {
    selfExecuteFn: async ({ chat_id, user }: BotContext): Promise<void> => {
      const backIndex: number = user?.back?.length ? user.back.length - 1 : -1;
      if (backIndex < 0) {
        await sendMessageHelper(chat_id, i18n.__('messages.start'), userBtn());
        return;
      }

      const step: number = get(user, `back[${backIndex}].step`, 1);
      const text: string = get(user, `back[${backIndex}].text`, 'Assalomu Aleykum');
      const btnBack = get(user, `back[${backIndex}].btn`, userBtn());
      const setting: boolean = get(user, `back[${backIndex}].setting`, false);

      if (setting) {
        await sendMessageHelper(chat_id, i18n.__('messages.start'), userBtn());
      } else {
        await sendMessageHelper(chat_id, text, btnBack);
      }

      await Promise.all([
        updateStep(chat_id, step),
        updateUser(chat_id, {
          back: get(user, 'back', []).filter((_, i) => i !== backIndex),
        }),
      ]);
    },
    middleware: ({ user }: BotContext): boolean => {
      return get(user, 'back', []).length !== 0;
    },
  },
  '⬅️ Orqaga': {
    selfExecuteFn: async ({ chat_id, user }: BotContext): Promise<void> => {
      const backIndex = user?.back?.length ? user.back.length - 1 : -1;
      if (backIndex < 0) {
        await sendMessageHelper(chat_id, i18n.__('messages.start'), userBtn());
        return;
      }

      const step: number = get(user, `back[${backIndex}].step`, 1);
      const text: string = get(user, `back[${backIndex}].text`, 'Assalomu Aleykum');
      const btnBack = get(user, `back[${backIndex}].btn`, userBtn());
      const setting: boolean = get(user, `back[${backIndex}].setting`, false);

      if (setting) {
        await sendMessageHelper(chat_id, i18n.__('messages.start'), userBtn());
      } else {
        await sendMessageHelper(chat_id, text, btnBack);
      }
      await Promise.all([
        updateStep(chat_id, step),
        updateUser(chat_id, {
          back: get(user, 'back', []).filter((_, i) => i !== backIndex),
        }),
      ]);
    },
    middleware: ({ user }: BotContext): boolean => {
      return get(user, 'back', []).length !== 0;
    },
  },
};

export const adminHandlers: Record<
  string,
  {
    middleware: (ctx: BotContext) => boolean | Promise<boolean>;
    selfExecuteFn?: (ctx: BotContext) => Promise<void>;
  }
> = {
  Filiallar: {
    selfExecuteFn: async ({ chat_id }: BotContext): Promise<void> => {
      await sendMessageHelper(
        chat_id,
        'Harakatni tanlang',
        buildKeyboard(["Qo'shish", "O'chirish", "O'zgartirish"], 2),
      );
      await updateBack(chat_id, { text: 'Xush kelibsiz', btn: adminBtn, step: 10 });
    },
    middleware: (_ctx: BotContext): boolean => {
      return true;
    },
  },
};
