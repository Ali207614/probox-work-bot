import { ReplyKeyboardMarkup, InlineKeyboardMarkup } from 'node-telegram-bot-api';

export interface IKeyboardButton {
  text: string;
  request_contact?: boolean;
}

export interface IInlineButton {
  text: string;
  callback_data: string;
}

export interface IMenuOptions {
  parse_mode?: 'Markdown' | 'HTML';
  reply_markup: ReplyKeyboardMarkup | InlineKeyboardMarkup;
}

export interface IMenuParams {
  chat_id: number;
}

export interface IListItem {
  id: string | number;
  name: string;
}

export interface IPagination {
  prev: number;
  next: number;
}
