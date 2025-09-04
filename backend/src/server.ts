import express from "express";

import { inizializationBOT } from "./bot/bot-actions.js";
import TelegramBot from "node-telegram-bot-api";
import { appDataSource } from "./database/data-source.js";
import { startCron } from "./bot/reminder.js";
import { telegramBotConfigs } from "./configs/configs.js";
import "./bot/admin/bot-actions.js";

export const telegramBOT = new TelegramBot(telegramBotConfigs.API_KEY_BOT as string, {
  polling: {
    interval: 300,
    autoStart: true
  }
});

const app = express();
app.listen(3001, async () => {
  console.log("Server is started");
  await appDataSource
    .initialize()
    .then(() => {
      console.log("Database is started");
      inizializationBOT();
      startCron();
    })
    .catch((error) => console.log(error));
});
