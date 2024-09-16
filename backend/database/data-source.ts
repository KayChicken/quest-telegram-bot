import { DataSource } from 'typeorm';
import { Users } from './models/users.js';

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "test",
  password: "test",
  database: "test",
  synchronize: true,
  logging: true,
  entities: [Users],
  subscribers: [],
  migrations: [],
})