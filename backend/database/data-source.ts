import { DataSource } from 'typeorm';
import { Users } from './models/users.js';

export const appDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "3701",
  database: "telegram-bot",
  synchronize: true,
  logging: false,
  entities: [Users],
  subscribers: [],
  migrations: [],
})

