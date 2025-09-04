import path from "node:path";
import { DatabaseConfigs, TelegramBotConfigs } from "./types/configs";
import dotenv from "dotenv";

dotenv.config({
  path: path.resolve(process.cwd(), process.env.NODE_ENV === "development" ? ".env.development" : ".env")
});

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

export const databaseConfigs: DatabaseConfigs = {
  DB_HOST: getEnvVar("DB_HOST"),
  DB_PORT: parseInt(getEnvVar("DB_PORT")),
  DB_DATABASE: getEnvVar("DB_DATABASE"),
  DB_PASSWORD: getEnvVar("DB_PASSWORD"),
  DB_USER: getEnvVar("DB_USER")
};

export const telegramBotConfigs: TelegramBotConfigs = {
  API_KEY_BOT: getEnvVar("API_KEY_BOT"),
  API_ADMIN_KEY_BOT_ADMIN: getEnvVar("API_ADMIN_KEY_BOT_ADMIN")
};
