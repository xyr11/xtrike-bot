const { Client } = require('discord.js') // eslint-disable-line no-unused-vars
const { presence, time } = require('../config')
const chalk = require('chalk')
const Amongoose = require('mongoose')
const { storeInfo, getInfo } = require('../modules/botInfo')

/** @param {Client} client */
exports.execute = async client => {
  console.log(chalk.green(`Ready as ${client.user.tag}! (${time()}) 🤖`))
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
  const upSince = (await getInfo('upSince')) || 0 // get time when bot started
  const now = Date.now()
  // don't update if the bot is down for <40 seconds only
  if (now - upSince > 40000) storeInfo('upSince', now)
}
