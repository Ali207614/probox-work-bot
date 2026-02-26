import type { SendMessageOptions } from 'node-telegram-bot-api';

import { Branch, type IBranch } from '../models/branch.model';
import { User } from '../models/user.model';
import { Lead, type LeadStatus } from '../models/lead.model';

import { sendMessageHelper, updateBack, updateStep, updateUser } from '../utils/helper';
import { buildKeyboard } from '../keyboards/inline.keyboards';
import { userBtn, mainMenuByLang } from '../keyboards/keyboards';
import i18n from '../utils/i18n';

import type { BotContext } from '../types/bot.types';
import type { IUser, IBack } from '../types/user.types';

type ButtonHandler = {
  middleware?: (ctx: BotContext) => boolean | Promise<boolean>;
  selfExecuteFn: (ctx: BotContext) => Promise<void>;
};

export type ButtonHandlersMap = Record<string, ButtonHandler>;

/**
 * -----------------------
 * Small helpers (no lodash)
 * -----------------------
 */
function normalizeLang(lang?: string): 'uz' | 'ru' {
  const l = String(lang ?? '').toLowerCase();
  return l === 'ru' ? 'ru' : 'uz';
}

function lastBack(user: IUser | null | undefined): { item: IBack; index: number } | null {
  if (!user?.back || user.back.length === 0) {
    return null;
  }
  const index = user.back.length - 1;
  const item = user.back[index];
  return item ? { item, index } : null;
}

type StatusRow = { _id: LeadStatus | 'Unknown'; count: number };

function prettyStatus(s: StatusRow['_id']): string {
  const map: Record<StatusRow['_id'], string> = {
    Active: '🟢 Active',
    Blocked: '⛔ Blocked',
    Purchased: '✅ Purchased',
    Returned: '↩️ Returned',
    Missed: '📵 Missed',
    Ignored: '⚪ Ignored',
    NoAnswer: '📴 NoAnswer',
    FollowUp: '🟡 FollowUp',
    Considering: '🤔 Considering',
    WillVisitStore: '🟠 WillVisitStore',
    WillSendPassport: '🟣 WillSendPassport',
    Scoring: '🧮 Scoring',
    ScoringResult: '🧾 ScoringResult',
    VisitedStore: '🏬 VisitedStore',
    NoPurchase: '🛑 NoPurchase',
    Closed: '🔴 Closed',
    Unknown: '• Unknown',
  };
  return map[s];
}

function buildReportText(opts: {
  lang: 'uz' | 'ru';
  slpName: string;
  slpCode: string;
  total: number;
  rows: StatusRow[];
}): string {
  const title = opts.lang === 'ru' ? '📊 Общий отчет' : '📊 Umumiy hisobot';
  const totalLabel = opts.lang === 'ru' ? '📌 Всего лидов' : '📌 Jami leadlar';

  let text = `${title}\n`;
  text += `👤 ${opts.slpName}\n`;
  text += `${totalLabel}: ${opts.total}\n\n`;

  if (opts.rows.length === 0) {
    text += opts.lang === 'ru' ? 'Пока лидов нет.' : "Hozircha lead yo'q.";
    return text;
  }

  text += opts.rows.map((r) => `${prettyStatus(r._id)}: ${r.count}`).join('\n');
  return text;
}

async function sendUmumiyHisobot(bot: BotContext['bot'], chat_id: number): Promise<void> {
  const user = (await User.findOne({ chat_id }).lean()) as IUser | null;
  const lang = normalizeLang(user?.language);

  if (!user?.slpCode) {
    const msg = lang === 'ru' ? '❌ Сначала выполните вход.' : '❌ Avval login qiling.';
    await sendMessageHelper(chat_id, msg, userBtn());
    return;
  }

  // ✅ Loading
  const loadingText = lang === 'ru' ? '⏳ Загрузка...' : '⏳ Yuklanmoqda...';
  const loadingMsg = await bot.sendMessage(chat_id, loadingText);

  try {
    const seller = String(user.slpCode).trim();
    if (!seller) {
      const msg = lang === 'ru' ? '❌ Некорректный SLP.' : "❌ SLP noto'g'ri.";
      await bot.deleteMessage(chat_id, loadingMsg.message_id);
      await sendMessageHelper(chat_id, msg, userBtn());
      return;
    }
    const rows = await Lead.aggregate<StatusRow>([
      { $match: { seller } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: { $ifNull: ['$_id', 'Unknown'] }, count: 1 } },
    ]);

    const total = rows.reduce((s, r) => s + r.count, 0);
    const slpName = String(user.slpName ?? user.fullName ?? '-').trim() || '-';

    const text = buildReportText({ lang, slpName, slpCode: seller, total, rows });

    // ✅ Loading o‘chirish
    await bot.deleteMessage(chat_id, loadingMsg.message_id);

    // ✅ Natija
    await sendMessageHelper(chat_id, text, mainMenuByLang(lang));
  } catch (e) {
    // loading o‘chirishga harakat qilamiz
    await bot.deleteMessage(chat_id, loadingMsg.message_id).catch(() => {});
    throw e;
  }
}

/**
 * -----------------------
 * ✅ BUTTON HANDLERS
 * -----------------------
 */
export const buttonHandlers: ButtonHandlersMap = {
  /**
   * Branch list UZ
   */
  '🏢 Filiallar': {
    selfExecuteFn: async ({ chat_id }: BotContext): Promise<void> => {
      const branches: IBranch[] = await Branch.find().lean();

      if (branches.length === 0) {
        await sendMessageHelper(chat_id, i18n.__('messages.location_not_available'));
        return;
      }

      await updateBack(chat_id, {
        text: i18n.__('messages.start'),
        btn: userBtn(),
        step: 10,
      });

      const btn: SendMessageOptions = buildKeyboard(
        branches.map((b) => b.name),
        2,
        true,
        true,
      );

      await sendMessageHelper(chat_id, i18n.__('messages.branch_list_text'), btn);
    },
  },

  /**
   * Branch list RU
   */
  '🏢 Филиалы': {
    selfExecuteFn: async ({ chat_id }: BotContext): Promise<void> => {
      const branches: IBranch[] = await Branch.find().lean();

      if (branches.length === 0) {
        await sendMessageHelper(chat_id, i18n.__('messages.location_not_available'));
        return;
      }

      await updateBack(chat_id, {
        text: i18n.__('messages.start'),
        btn: userBtn(),
        step: 10,
      });

      const btn: SendMessageOptions = buildKeyboard(
        branches.map((b) => b.name),
        2,
        true,
        true,
      );

      await sendMessageHelper(chat_id, i18n.__('messages.branch_list_text'), btn);
    },
  },

  /**
   * ✅ Report UZ
   */
  '📊 Umumiy hisobot': {
    middleware: async ({ chat_id }: BotContext): Promise<boolean> => {
      const u = (await User.findOne({ chat_id }).select({ slpCode: 1 }).lean()) as Pick<
        IUser,
        'slpCode'
      > | null;
      return Boolean(u?.slpCode);
    },
    selfExecuteFn: async ({ chat_id, bot }: BotContext): Promise<void> => {
      const user = (await User.findOne({ chat_id }).lean()) as IUser | null;
      const lang = normalizeLang(user?.language);

      await updateBack(chat_id, {
        text: i18n.__('messages.start'),
        btn: mainMenuByLang(lang),
        step: 10,
      });

      await sendUmumiyHisobot(bot, chat_id);
    },
  },

  /**
   * ✅ Report RU
   */
  '📊 Общий отчет': {
    middleware: async ({ chat_id }: BotContext): Promise<boolean> => {
      const u = (await User.findOne({ chat_id }).select({ slpCode: 1 }).lean()) as Pick<
        IUser,
        'slpCode'
      > | null;
      return Boolean(u?.slpCode);
    },
    selfExecuteFn: async ({ chat_id, bot }: BotContext): Promise<void> => {
      const user = (await User.findOne({ chat_id }).lean()) as IUser | null;
      const lang = normalizeLang(user?.language);

      await updateBack(chat_id, {
        text: i18n.__('messages.start'),
        btn: mainMenuByLang(lang),
        step: 10,
      });

      await sendUmumiyHisobot(bot, chat_id);
    },
  },

  /**
   * Back RU
   */
  '⬅️ Назад': {
    middleware: ({ user }: BotContext): boolean => Boolean(user?.back && user.back.length > 0),
    selfExecuteFn: async ({ chat_id, user }: BotContext): Promise<void> => {
      const b = lastBack(user);
      if (!b) {
        await sendMessageHelper(chat_id, i18n.__('messages.start'), userBtn());
        return;
      }

      const { item, index } = b;
      const setting = Boolean(item.setting);

      if (setting) {
        await sendMessageHelper(chat_id, i18n.__('messages.start'), userBtn());
      } else {
        await sendMessageHelper(chat_id, item.text, item.btn);
      }

      await Promise.all([
        updateStep(chat_id, item.step),
        updateUser(chat_id, {
          back: user.back.filter((_, i) => i !== index),
        }),
      ]);
    },
  },

  /**
   * Back UZ
   */
  '⬅️ Orqaga': {
    middleware: ({ user }: BotContext): boolean => Boolean(user?.back && user.back.length > 0),
    selfExecuteFn: async ({ chat_id, user }: BotContext): Promise<void> => {
      const b = lastBack(user);
      if (!b) {
        await sendMessageHelper(chat_id, i18n.__('messages.start'), userBtn());
        return;
      }

      const { item, index } = b;
      const setting = Boolean(item.setting);

      if (setting) {
        await sendMessageHelper(chat_id, i18n.__('messages.start'), userBtn());
      } else {
        await sendMessageHelper(chat_id, item.text, item.btn);
      }

      await Promise.all([
        updateStep(chat_id, item.step),
        updateUser(chat_id, {
          back: user.back.filter((_, i) => i !== index),
        }),
      ]);
    },
  },
};
