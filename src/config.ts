import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';

dotenv.config();
const isDev: boolean = process.env.NODE_ENV === 'development';
const bot = new TelegramBot(
  (isDev ? process.env.TELEGRAM_BOT_TOKEN_TEST : process.env.TELEGRAM_BOT_TOKEN) ?? '',
  { polling: true },
);

export const config = {
  bot,
  mongoURI: process.env.MONGO_URI ?? 'mongodb://localhost:27017/probox_work_db',
  personalChatId: process.env.PERSONAL_CHAT_ID ?? '',
};
