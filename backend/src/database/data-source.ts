import { DataSource } from "typeorm";
import { Users } from "./models/users.js";
import { Reminder } from "./models/reminder.js";
import { databaseConfigs } from "../configs/configs.js";

export const appDataSource = new DataSource({
  type: "postgres",
  host: databaseConfigs.DB_HOST,
  port: databaseConfigs.DB_PORT,
  username: databaseConfigs.DB_USER,
  password: databaseConfigs.DB_PASSWORD,
  database: databaseConfigs.DB_DATABASE,
  synchronize: true,
  logging: false,
  entities: [Users, Reminder],
  subscribers: [],
  migrations: ["dist/database/migrations/*{.ts,.js}"]
});
