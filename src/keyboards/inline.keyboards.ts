import { get } from 'lodash';
import i18n from '../utils/i18n';
import type { IMenuOptions, IListItem, IPagination, IInlineButton } from '../types/keyboards.types';
import type { IUser } from '../types/user.types';
import { infoUser, updateUser } from '../utils/helper';
import type { KeyboardButton, SendMessageOptions } from 'node-telegram-bot-api';

export async function createInlineKeyboard(
  chat_id: string | number = '',
  list: IListItem[] = [],
  count = 1,
  cbName = '',
  pagination: IPagination = { prev: 0, next: 10 },
): Promise<IMenuOptions> {
  const user: IUser | null = await infoUser({ chat_id: Number(chat_id) });

  let result: IListItem[] = list;
  const next: number = get(pagination, 'next', 0);
  const prev: number = get(pagination, 'prev', 10);

  const arr: IInlineButton[][] = [];

  if (result.length > 10) {
    const nextCount = list.slice(prev, next + 1).length - list.slice(prev, next)?.length;

    result = list.slice(prev, next);

    if (user) {
      await updateUser(+chat_id, {
        select: { ...get(user, 'select', {}), pagination: { next, prev } },
      });
    }

    const objCb: Record<string, string> = {
      group: 'paginationGroup',
      category: 'paginationCategory',
    };

    const paginationBtn: IInlineButton[] = [
      prev === 0
        ? undefined
        : {
            text: i18n.__('menu.prev'),
            callback_data: `${objCb[cbName]}#prev#${prev}`,
          },
      nextCount !== 0
        ? {
            text: i18n.__('menu.next'),
            callback_data: `${objCb[cbName]}#next#${next}`,
          }
        : undefined,
    ].filter((item): item is IInlineButton => !!item);

    arr.push(paginationBtn);
  }

  for (let i: number = 0; i < result.length; i += count) {
    arr.push(
      result
        .slice(i, i + count)
        .map((itemData: IListItem): { text: string; callback_data: string } => ({
          text: itemData.name,
          callback_data: `${cbName}#${itemData.id}`,
        })),
    );
  }

  return {
    reply_markup: {
      inline_keyboard: arr,
      resize_keyboard: true,
    },
  };
}

export function buildKeyboard(
  list: string[] = [],
  count = 1,
  back = true,
  near = false,
): SendMessageOptions {
  const rows: KeyboardButton[][] = [];

  for (let i = 0; i < list.length; i += count) {
    const chunk = list.slice(i, i + count).map((item) => ({
      text: item,
    }));
    rows.push(chunk);
  }

  if (near) {
    rows.push([
      {
        text: i18n.__('messages.nearest_branch'),
        request_location: true,
      },
    ]);
  }

  if (back) {
    rows.push([{ text: i18n.__('menu.back') }]);
  }

  return {
    parse_mode: 'Markdown',
    reply_markup: {
      resize_keyboard: true,
      keyboard: rows,
    },
  };
}
