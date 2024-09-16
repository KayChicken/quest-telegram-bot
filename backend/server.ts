import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { inizializationBOT } from "./bot/bot-actions";
import TelegramBot from 'node-telegram-bot-api';

export const telegramBOT = new TelegramBot(process.env.API_KEY_BOT as string, {
  polling: {
    interval: 300,
    autoStart: true,
  },
});



const app = express();
app.listen(3000, () => {
  console.log("Server is started");
  setTimeout(() => {
    inizializationBOT();
  }, 1000)

});
