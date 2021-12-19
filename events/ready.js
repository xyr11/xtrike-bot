const chalk = require('chalk')
const Amongoose = require('mongoose')
const config = require('../config')
const { presence, time } = require('../modules/base')
const { storeInfo, getInfo } = require('../modules/botInfo')

/** @param {import('discord.js').Client} client */
exports.execute = async client => {
  console.log(chalk.green(`Ready as ${client.user.tag}! 🤖`, chalk.bgGreenBright.black(`(${time()})`)))
  // presence
  if (presence.activity) {
    client.user.setPresence({
      activities: [{ name: presence.activity, type: presence.activityType.toUpperCase() }],
      status: config.isMobile ? 'online' : presence.status
    })
  }

  // server
  require('../modules/express')()

  // mongodb
  await Amongoose.connect(config.mongoURI, { keepAlive: true })

  // statistics
  // server count
  console.log(chalk.blue(`Stats: Currently in ${client.guilds.cache.size} servers with a combined amount of ${client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b)} members`))
  storeInfo('serverCount', client.guilds.cache.size)
  // uptime
  if (!await getInfo('upSince')) storeInfo('upSince', Date.now()) // dont update if there is already a value
  // bot ready
  storeInfo('botReady', (await getInfo('botReady') || 0) + 1)
}
