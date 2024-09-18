import { Reminder } from './models/reminder.js'
import { Users } from './models/users.js'
import REPOSITORIES from './repositorires.js'

export const createUser = async (user: Users) => {
  try {
    const userModule = await REPOSITORIES.bot.users.save({ ...user })
    return userModule
  }
  catch (e) {
    throw new Error(e);
  }


}

export const getUserByChatID = async (chatID: number) => {
  try {
    const user = await REPOSITORIES.bot.users.findOne({ where: { chatID: chatID } })
    return user
  }
  catch (e) {
    throw new Error(e);
  }

}

export const setStageByChatID = async (chatID: number, stage: string) => {
  try {
    const updateUser = await REPOSITORIES.bot.users.update({ chatID: chatID }, { stage: stage })
    return updateUser
  }
  catch (e) {
    throw new Error(e);
  }

}

export const setUsernameByChatID = async (chatID: number, username: string) => {
  try {
    const usernameUpdate = await REPOSITORIES.bot.users.update({ chatID: chatID }, { username: username })
    return usernameUpdate
  }
  catch (e) {
    throw new Error(e);
  }

}

export const getUserNameByChatID = async (chatID: number) => {
  try {
    const usernameUser = await REPOSITORIES.bot.users.findOne({ where: { chatID: chatID } })
    return usernameUser.username
  }
  catch (e) {
    throw new Error(e);
  }

}


export const getCurrentScoreByChatID = async (chatID: number) => {
  try {
    const scoreScore = await REPOSITORIES.bot.users.findOne({ where: { chatID: chatID } })
    return scoreScore.stage_9_score
  }
  catch (e) {
    throw new Error(e);
  }

}

export const upCurrentScoreNineStage = async (chatID: number) => {
  try {
    const scoreScore = await REPOSITORIES.bot.users.findOne({ where: { chatID: chatID } })
    await REPOSITORIES.bot.users.update({ chatID: chatID }, { stage_9_score: scoreScore.stage_9_score + 1 })
    return scoreScore.stage_9_score + 1
  }
  catch (e) {
    throw new Error(e);
  }

}


export const setEmailForUser = async (chatID: number, email: string) => {
  try {
    const emailUpdate = await REPOSITORIES.bot.users.update({ chatID: chatID }, { email: email })
    return emailUpdate
  }
  catch (e) {
    throw new Error(e);
  }
}

export const startTimeoutInDB = async (
  chatID: number,
  text: string = '',
  reply_markup?: object,
  time: number = 10 * 1000 * 60
) => {
  try {
    const sendAt = new Date(Date.now() + time); // Время отправки


    const newReminder = REPOSITORIES.bot.reminder.create({
      chatID,
      message: text,
      replyMarkup: reply_markup,
      sendAt,
    });

    await REPOSITORIES.bot.reminder.save(newReminder);
  }

  catch (e) {
    throw new Error(e);
  }

};

export const stopTimeoutInDB = async (
  chatID: number,
) => {
  try {
    await REPOSITORIES.bot.reminder.delete({ chatID: chatID })
  }
  catch (e) {
    throw new Error(e);
  }

};