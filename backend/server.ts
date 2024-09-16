import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { telegramBOT } from "./bot/bot-settings";
import { inizializationBOT } from "./bot/bot-actions";

const app = express();

console.log(process.env.API_KEY_BOT);

app.listen(3000, () => {
  console.log("Server is started");
  inizializationBOT(telegramBOT);
});
