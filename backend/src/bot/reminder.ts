import cron from "node-cron";
import REPOSITORIES from "../database/repositorires";
import { LessThanOrEqual } from "typeorm";
import { telegramBOT } from "../server";
import TelegramBot from "node-telegram-bot-api";

export const startCron = () => {
  // Планировщик будет проверять каждую минуту на наличие сообщений для отправки
  cron.schedule("* * * * *", async () => {
    const reminderRepository = REPOSITORIES.bot.reminder;
    const now = new Date();
    // Найдите все неотправленные сообщения, которые должны быть отправлены
    const remindersToSend = await reminderRepository.find({
      where: {
        sendAt: LessThanOrEqual(now)
      }
    });

    // Отправьте все сообщения
    for (const reminder of remindersToSend) {
      try {
        await telegramBOT.sendMessage(reminder.chatID, reminder.message, {
          reply_markup: reminder.replyMarkup as TelegramBot.InlineKeyboardMarkup | TelegramBot.ReplyKeyboardMarkup
        });

        // Обновите статус, чтобы пометить сообщение как отправленное
        await reminderRepository.remove(reminder);
      } catch (error) {
        console.error(`Ошибка при отправке сообщения для chatID ${reminder.chatID}:`, error);
      }
    }
  });
};
