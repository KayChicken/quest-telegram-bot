import { Users } from './models/users.js'
import REPOSITORIES from './repositorires.js'

export const createUser = async (user: Users) => {
  try {
    const userModule = await REPOSITORIES.bot.users.save({ ...user })
    console.log(userModule)
  }
  catch (e) {
    console.log(e);
  }


}

export const getUserByChatID = async (chatID: number) => {
  try {
    const user = await REPOSITORIES.bot.users.findOne({ where: { chatID: chatID } })
    return user
  }
  catch (e) {
    console.log(e);
  }

}

export const setStageByChatID = async (chatID: number, stage: string) => {
  try {
    const updateUser = await REPOSITORIES.bot.users.update({ chatID: chatID }, { stage: stage })
    return updateUser
  }
  catch (e) {
    console.log(e);
  }

}

export const setUsernameByChatID = async (chatID: number, username: string) => {
  const usernameUpdate = await REPOSITORIES.bot.users.update({ chatID: chatID }, { username: username })
  return usernameUpdate
}

export const getUserNameByChatID = async (chatID: number) => {
  const usernameUser = await REPOSITORIES.bot.users.findOne({ where: { chatID: chatID } })
  return usernameUser.username
}


export const getCurrentScoreByChatID = async (chatID: number) => {
  const scoreScore = await REPOSITORIES.bot.users.findOne({ where: { chatID: chatID } })
  return scoreScore.stage_9_score
}

export const upCurrentScoreNineStage = async (chatID: number) => {
  const scoreScore = await REPOSITORIES.bot.users.findOne({ where: { chatID: chatID } })
  await REPOSITORIES.bot.users.update({ chatID: chatID }, { stage_9_score: scoreScore.stage_9_score + 1 })
  return scoreScore.stage_9_score + 1
}


export const setEmailForUser = async (chatID: number, email: string) => {
  const emailUpdate = await REPOSITORIES.bot.users.update({ chatID: chatID }, { email: email })
  return emailUpdate
}