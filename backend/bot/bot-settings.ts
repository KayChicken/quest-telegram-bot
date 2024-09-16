import TelegramBot from "node-telegram-bot-api";
export const telegramBOT = new TelegramBot(process.env.API_KEY_BOT as string, {
  polling: {
    interval: 300,
    autoStart: true,
  },
});
