import type { CallbackQuery, Message } from 'node-telegram-bot-api';
import type TelegramBot from 'node-telegram-bot-api';
import { config } from './config';
import { CallbackController } from './controllers/callback.controller';
import { connectDB } from './db/connect';
import { TextController } from './controllers/text.controller';
import { ContactController } from './controllers/contact.controller';
import { ErrorController } from './controllers/error.controller';

export async function startBot(): Promise<void> {
  try {
    // 🔹 Mongo ulanishi
    await connectDB();

    const bot = config.bot;
    const textController = new TextController();
    const callbackController = new CallbackController();
    const contactController = new ContactController();
    const errorController = new ErrorController();

    const PERSONAL_CHAT_ID = Number(config.personalChatId);

    function isPrivateChat(msg: Message | CallbackQuery['message'] | undefined): boolean {
      return msg?.chat?.type === 'private';
    }

    function sendError(bot: TelegramBot, error: unknown): void {
      const message =
        error instanceof Error
          ? `❌ Error: ${error.message}`
          : `❌ Unknown error: ${JSON.stringify(error)}`;
      if (PERSONAL_CHAT_ID) {
        bot.sendMessage(PERSONAL_CHAT_ID, message).catch(console.error);
      } else {
        console.error('PERSONAL_CHAT_ID not set in .env');
      }
    }

    // 🔹 Telegram eventlar
    bot.on('text', async (msg: Message): Promise<void> => {
      try {
        if (!isPrivateChat(msg)) {
          return;
        }
        const chatId = msg.chat.id;
        await textController.handle(bot, msg, chatId);
      } catch (err) {
        console.error('Text handler error:', err);
        sendError(bot, err);
      }
    });

    bot.on('callback_query', async (query: CallbackQuery): Promise<void> => {
      try {
        if (!isPrivateChat(query.message)) {
          return;
        }
        const chatId = query.message?.chat.id ?? 0;
        const data = query.data?.split('#') ?? [];
        await callbackController.handle(bot, query, chatId, data);
      } catch (err) {
        console.error('Callback handler error:', err);
        sendError(bot, err);
      }
    });

    bot.on('contact', async (msg: Message): Promise<void> => {
      try {
        if (!isPrivateChat(msg)) {
          return;
        }
        const chatId = msg.chat.id;
        await contactController.handle(bot, msg, chatId);
      } catch (err) {
        console.error('Contact handler error:', err);
        sendError(bot, err);
      }
    });

    bot.on('polling_error', (error: Error): void => {
      errorController.handle(error);
    });

    console.log('✅ Bot ishga tushdi!');
  } catch (error) {
    console.error('❌ Bot start xatosi:', error);
    process.exit(1);
  }
}

// 🔹 Bootstrap
void startBot().catch((error) => {
  console.error('❌ Bot start xatosi:', error);
  process.exit(1);
});
