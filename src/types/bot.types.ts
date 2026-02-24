import { Message } from 'node-telegram-bot-api';
import TelegramBot from 'node-telegram-bot-api';
import { IUser } from '../types/user.types';

export interface BotContext {
  chat_id: number;
  user: IUser;
  msgText: string;
  msg?: Message;
  bot: TelegramBot;
}

export interface BotContextWithData {
  chat_id: number;
  user: IUser;
  msgText: string;
  msg?: Message;
  bot: TelegramBot;
  data: string[];
}

export type MiddlewareFn = (ctx: BotContext) => Promise<boolean> | boolean;
export type ExecuteFn = (ctx: BotContext) => Promise<void>;

export interface ButtonAction {
  selfExecuteFn?: ExecuteFn;
  middleware?: MiddlewareFn;
}

export type ActionTree = Record<string, ButtonAction>;

export interface HandlerRegistry {
  textHandlers: ActionTree;
  stepHandlers: ActionTree;
}


