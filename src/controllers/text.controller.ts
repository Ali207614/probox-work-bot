import type { Message } from 'node-telegram-bot-api';
import type TelegramBot from 'node-telegram-bot-api';

import i18n from '../utils/i18n';
import { sendMessageHelper } from '../utils/helper';
import { User } from '../models/user.model';
import { mainMenuByLang, userBtn, option } from '../keyboards/keyboards';

import { Lead, type LeadStatus } from '../models/lead.model';

import type { IUser } from '../types/user.types';
import type { BotContext } from '../types/bot.types';

function normalizeLang(lang?: string): 'uz' | 'ru' {
  const l = String(lang ?? '').toLowerCase();
  return l === 'ru' || l === 'rus' || l === 'russian' ? 'ru' : 'uz';
}

type StatusRow = { _id: LeadStatus | 'Unknown'; count: number };

const TAIL: Array<LeadStatus> = ['Purchased', 'NoPurchase', 'Closed'];

function prettyStatusUz(status: StatusRow['_id']): string | null {
  // Archived umuman yo'q (schema'da ham yo'q), Unknown ham chiqarilmaydi
  const map: Partial<Record<StatusRow['_id'], string>> = {
    Active: '🟢 Yangi lead',
    Blocked: '⛔ Bloklangan',
    FollowUp: '🟡 Qayta aloqa',
    Considering: '🤔 O‘ylab ko‘radi',
    WillVisitStore: '🏬 Do‘konga boradi',
    WillSendPassport: '🪪 Pasport yuboradi',
    Scoring: '🧮 Skoring',
    ScoringResult: '🧾 Skoring natija',
    VisitedStore: '🚶 Do‘konga keldi',
    Missed: '📵 O‘tkazib yuborildi',
    NoAnswer: '📴 Javob bermadi',
    Ignored: '⚪ E’tiborsiz',
    Returned: '↩️ Qaytarildi',
    Purchased: '✅ Sotildi',
    NoPurchase: '🛑 Sotilmadi',
    Closed: '🔴 Sifatsiz',
  };

  return map[status] ?? null;
}

function normalizeRows(rows: StatusRow[]): StatusRow[] {
  // 1) null/undefined/Unknown va map yo'q statuslarni olib tashlaymiz
  const cleaned = rows.filter(
    (r) => r._id && r._id !== 'Unknown' && prettyStatusUz(r._id) !== null,
  );

  // 2) Active birinchi, tail oxirida, qolganlari count bo'yicha
  const active = cleaned.filter((r) => r._id === 'Active');
  const tail = TAIL.map((k) => cleaned.find((r) => r._id === k)).filter(Boolean) as StatusRow[];
  const middle = cleaned
    .filter((r) => r._id !== 'Active' && !TAIL.includes(r._id as LeadStatus))
    .sort((a, b) => b.count - a.count);

  // Active bir nechta bo'lib qolsa, count bo'yicha saralab bitta qilish ham mumkin:
  const activeOne: StatusRow[] = [];

  if (active.length > 0) {
    active.sort((a, b) => b.count - a.count);
    const first = active[0];
    if (first) {
      activeOne.push(first);
    }
  }

  return [...activeOne, ...middle, ...tail];
}

function buildReportText(opts: {
  lang: 'uz' | 'ru';
  slpName: string;
  slpCode: number;
  total: number;
  rows: StatusRow[];
}): string {
  const title = opts.lang === 'ru' ? '📊 Общий отчет' : '📊 Umumiy hisobot';
  const totalLabel = opts.lang === 'ru' ? '📌 Всего лидов' : '📌 Jami leadlar';

  let text = `${title}\n`;
  text += `👤 ${opts.slpName}\n`;
  text += `${totalLabel}: ${opts.total} ta\n\n`;

  const rowsSorted = normalizeRows(opts.rows);

  if (rowsSorted.length === 0) {
    text += opts.lang === 'ru' ? 'Пока лидов нет.' : "Hozircha lead yo'q.";
    return text;
  }

  const lines: string[] = [];

  // Head (Active + middle)
  for (const r of rowsSorted) {
    if (TAIL.includes(r._id as LeadStatus)) {
      continue;
    }
    const label = prettyStatusUz(r._id);
    if (!label) {
      continue;
    }
    lines.push(`${label}: ${r.count} ta`);
  }

  // Tail (Purchased, NoPurchase, Closed) — bo'sh qatordan keyin
  const tailLines: string[] = [];
  for (const key of TAIL) {
    const row = rowsSorted.find((r) => r._id === key);
    if (!row) {
      continue;
    }
    const label = prettyStatusUz(row._id);
    if (!label) {
      continue;
    }
    tailLines.push(`${label}: ${row.count} ta`);
  }

  if (tailLines.length) {
    // ✅ bitta pustoy joy
    lines.push('');
    lines.push(...tailLines);
  }

  text += lines.join('\n');
  return text;
}

/**
 * Sizning LeadSchema'ingizda "slpCode" yo'q.
 * Leadlarda menejer kodi "seller" (string) sifatida bor.
 * Shuning uchun match: { seller: user.slpCodeString } (yoki slpName) bo'lishi kerak.
 *
 * Pastda user.slpCode ni stringga o'tkazib seller bilan solishtiryapmiz.
 * Agar sizda leadlarda "seller" boshqa formatda bo'lsa, shu joyni moslang.
 */
async function sendUmumiyHisobot(bot: BotContext['bot'], chat_id: number): Promise<void> {
  const loadingText = '⏳ Yuklanmoqda...';
  const loadingMsg = await bot.sendMessage(chat_id, loadingText);
  const user = (await User.findOne({ chat_id }).lean()) as IUser | null;
  const lang = normalizeLang(user?.language);

  if (!user?.slpCode) {
    const msg = lang === 'ru' ? '❌ Сначала выполните вход.' : '❌ Avval login qiling.';
    await bot.deleteMessage(chat_id, loadingMsg.message_id);
    await sendMessageHelper(chat_id, msg, userBtn());
    return;
  }

  // ✅ Loading

  try {
    const seller = String(user.slpCode).trim();
    if (!seller) {
      const msg = lang === 'ru' ? '❌ Некорректный SLP.' : "❌ SLP noto'g'ri.";
      await bot.deleteMessage(chat_id, loadingMsg.message_id);
      await sendMessageHelper(chat_id, msg, userBtn());
      return;
    }
    const rows = await Lead.aggregate<StatusRow>([
      {
        $match: {
          operator: seller,
          status: { $nin: ['Archived', null] },
        },
      },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const total = rows.reduce((s, r) => s + r.count, 0);
    const slpName = String(user.slpName ?? user.fullName ?? '-').trim() || '-';

    const text = buildReportText({ lang, slpName, slpCode: +seller, total, rows });

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

export class TextController {
  async handle(_bot: TelegramBot, msg: Message, chatId: number): Promise<void> {
    try {
      const text = (msg.text ?? '').trim();
      if (!text) {
        return;
      }

      const user = (await User.findOne({ chat_id: chatId }).lean()) as IUser | null;
      const lang = normalizeLang(user?.language ?? 'uz');

      // ✅ MAIN MENU: report
      if (text === '📊 Umumiy hisobot' || text === '📊 Общий отчет') {
        await sendUmumiyHisobot(_bot, chatId);
        return;
      }

      // back -> menu
      if (text === '⬅️ Orqaga' || text === '⬅️ Назад') {
        await sendMessageHelper(chatId, i18n.__('messages.start'), mainMenuByLang(lang));
        return;
      }

      // default
      if (user?.slpCode) {
        await sendMessageHelper(chatId, i18n.__('messages.start'), mainMenuByLang(lang));
      } else {
        await sendMessageHelper(chatId, i18n.__('messages.start'), option);
      }
    } catch (err) {
      console.error('TextController error:', err);
      await sendMessageHelper(chatId, i18n.__('messages.error'));
    }
  }
}
