const { Client } = require('discord.js') // eslint-disable-line no-unused-vars
const { presence, time } = require('../config')
const chalk = require('chalk')
const Amongoose = require('mongoose')
const { storeInfo, getInfo } = require('../modules/botInfo')

/** @param {Client} client */
exports.execute = async client => {
  console.log(chalk.green(`Ready as ${client.user.tag}! 🤖`, chalk.bgGreenBright.black(`(${time()})`)))
  // presence
  if (presence.activity) {
    client.user.setPresence({
      activities: [{ name: presence.activity, type: presence.activityType }],
      status: process.env.ISMOBILE === 'true' ? 'online' : presence.status
    })
  }

  // server
  require('../modules/express')()

  // mongodb
  await Amongoose.connect(process.env.MONGO_URI, { keepAlive: true })

  // statistics
  // server count
  console.log(chalk.blue(`Stats: Currently in ${client.guilds.cache.size} servers with a combined amount of ${client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b)} members`))
  storeInfo('serverCount', client.guilds.cache.size)
  // uptime
  if (!await getInfo('upSince')) storeInfo('upSince', Date.now()) // dont update if there is already a value
  // bot ready
  storeInfo('botReady', (await getInfo('botReady') || 0) + 1)
}
