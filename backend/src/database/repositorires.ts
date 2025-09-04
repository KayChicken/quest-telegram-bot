import { appDataSource } from "./data-source.js";
import { Reminder } from "./models/reminder.js";
import { Users } from "./models/users.js";

/** List of all repositories for each database */
const REPOSITORIES = {
  bot: {
    users: appDataSource.getRepository(Users),
    reminder: appDataSource.getRepository(Reminder)
  }
};

export default REPOSITORIES;
