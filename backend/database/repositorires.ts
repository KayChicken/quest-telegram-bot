import { appDataSource } from './data-source.js';
import { Users } from './models/users.js';

/** List of all repositories for each database */
const REPOSITORIES = {
  bot: {
    users: appDataSource.getRepository(Users)
  },
};

export default REPOSITORIES;
