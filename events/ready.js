const { Client } = require('discord.js') // eslint-disable-line no-unused-vars
const { presence, time } = require('../config')
const chalk = require('chalk')
const Amongoose = require('mongoose')
const { storeInfo, getInfo } = require('../modules/botInfo')

/** @param {Client} client */
exports.execute = async client => {
  console.log(chalk.green(`Ready as ${client.user.tag}! 🤖`, chalk.bgGreenBright.black(`(${time()})`)))
  console.log(chalk.blue(`Stats: Currently in ${client.guilds.cache.size} servers with a combined amount of ${client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b)} members`))

  // presence
  if (presence.activity) {
    client.user.setPresence({
      activities: [{ name: presence.activity, type: presence.activityType }],
      status: process.env.ISMOBILE === 'true' ? 'online' : presence.status
    })
  }

  // mongodb
  await Amongoose.connect(process.env.MONGO_URI, { keepAlive: true })

  // uptime
  const upSince = (await getInfo('upSince')) || null
  if (!upSince) storeInfo('upSince', Date.now()) // dont update if there is already a value
}
