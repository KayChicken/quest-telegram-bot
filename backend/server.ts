import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { inizializationBOT } from "./bot/bot-actions";
import TelegramBot from 'node-telegram-bot-api';
import { appDataSource } from './database/data-source.js';

export const telegramBOT = new TelegramBot(process.env.API_KEY_BOT as string, {
  polling: {
    interval: 300,
    autoStart: true,
  },
});



const app = express();
app.listen(3000, async () => {
  console.log("Server is started");
  await appDataSource.initialize()
    .then(() => {
      console.log("Database is started")
      inizializationBOT();
    })
    .catch((error) => console.log(error))
});
