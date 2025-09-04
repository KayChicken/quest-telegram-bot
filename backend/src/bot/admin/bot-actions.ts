import { Between } from "typeorm";
import REPOSITORIES from "../../database/repositorires.js";
import TelegramBot from "node-telegram-bot-api";
import { telegramBotConfigs } from "../../configs/configs.js";
import { Users } from "../../database/models/users.js";

export const adminTelegramBot = new TelegramBot(telegramBotConfigs.API_ADMIN_KEY_BOT_ADMIN as string, {
  polling: {
    interval: 300,
    autoStart: true
  }
});

const adminKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: "📊 Получить статистику за текущий день" }],
      [{ text: "📅 Получить статистику за всё время" }],
      [{ text: "🔨 Сбросить прогресс у меня" }]
    ],
    resize_keyboard: true
  }
};

adminTelegramBot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await adminTelegramBot.sendMessage(chatId, "Привет! Выберите действие:", adminKeyboard);
});

// Обработка кнопок
adminTelegramBot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  if (!msg.text) return;

  // Сброс прогресса
  if (msg.text === "🔨 Сбросить прогресс у меня") {
    const findUser = await REPOSITORIES.bot.users
      .findOne({ where: { chatID: chatId } })
      .catch(() => Promise.resolve(undefined));

    if (!findUser) return adminTelegramBot.sendMessage(chatId, "Пользователь не найден");

    await REPOSITORIES.bot.users.delete({ chatID: chatId }).catch((e) => {
      console.error(`Произошла ошибка при сбрасывании этапов ${e}`);
      return adminTelegramBot.sendMessage(chatId, "Произошла ошибка при сбросе этапов");
    });

    return adminTelegramBot.sendMessage(chatId, "Этапы успешно сброшены");
  }

  if (/^\d{2}$/.test(msg.text)) {
    const day = parseInt(msg.text, 10);

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const lastDay = new Date(year, month + 1, 0).getDate();

    if (day < 1 || day > lastDay) {
      return adminTelegramBot.sendMessage(chatId, "❌ Некорректная дата");
    }

    // Дата начала/конца
    const dateStart = new Date(year, month, day, 0, 0, 0, 0);
    const dateEnd = new Date(year, month, day + 1, 0, 0, 0, 0);

    const users = await REPOSITORIES.bot.users.find({
      where: { created_at: Between(dateStart, dateEnd) }
    });

    const stats = calculateStats(users);

    const reportDate = dateStart.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });

    const report = `
📊 Отчёт за ${reportDate}:

🟢 На старте: ${stats.start}
🔄 Дошли до репоста: ${stats.repost}
➡️ После репоста (без промокода): ${stats.afterRepost}
🏁 Дошли до конца: ${stats.end}
📌 Различные этапы: ${stats.other}
    `;

    return adminTelegramBot.sendMessage(chatId, report);
  }

  // Статистика за день
  if (msg.text === "📊 Получить статистику за текущий день") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const users = await REPOSITORIES.bot.users.find({
      where: { created_at: Between(today, tomorrow) }
    });

    const stats = calculateStats(users);

    const reportDate = today.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });

    const report = `
📊 Отчёт за ${reportDate}:

🟢 На старте: ${stats.start}
🔄 Дошли до репоста: ${stats.repost}
➡️ После репоста (без промокода): ${stats.afterRepost}
🏁 Дошли до конца: ${stats.end}
📌 Различные этапы: ${stats.other}
    `;

    return adminTelegramBot.sendMessage(chatId, report);
  }

  // Статистика за всё время
  if (msg.text === "📅 Получить статистику за всё время") {
    const users = await REPOSITORIES.bot.users.find();

    const stats = calculateStats(users);

    const report = `
📅 Отчёт за всё время:

🟢 На старте: ${stats.start}
🔄 Дошли до репоста: ${stats.repost}
➡️ После репоста (без промокода): ${stats.afterRepost}
🏁 Дошли до конца: ${stats.end}
📌 Различные этапы: ${stats.other}
    `;

    return adminTelegramBot.sendMessage(chatId, report);
  }
});

// Универсальная функция подсчёта
function calculateStats(users: Users[]) {
  let stats = {
    start: 0,
    repost: 0,
    afterRepost: 0,
    end: 0,
    other: 0
  };

  users.forEach((u) => {
    if (u.stage === "start") {
      stats.start++;
    } else if (["stage_41-2", "stage_41-3"].includes(u.stage)) {
      stats.repost++;
    } else if (["stage_42"].includes(u.stage)) {
      stats.afterRepost++;
    } else if (u.stage === "end" || u.stage === "stage_42-1") {
      stats.end++;
    } else {
      stats.other++;
    }
  });

  return stats;
}
