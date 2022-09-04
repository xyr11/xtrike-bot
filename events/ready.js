const Amongoose = require('mongoose')
const config = require('../config')
const { presence } = require('../modules/base')
const { storeInfo, getInfo } = require('../modules/botInfo')
const { logGood, logInfo, logUrgent } = require('../modules/logger')

/** @param {import('discord.js').Client} client */
exports.execute = async client => {
  // Log to console
  logGood(`Ready as ${client.user.tag}! 🤖`)

  // Presence
  if (presence.activity) {
    client.user.setPresence({
      activities: [{ name: presence.activity, type: presence.activityType.toUpperCase() }],
      status: config.isMobile ? 'online' : presence.status
    })
  }

  // Run server
  require('../modules/express')()

  // Connect to MongoDB server
  await Amongoose.connect(config.mongoURI, { keepAlive: true })
    .then(() => logGood('Connected to database'))
    .catch(logUrgent)

  // Statistics
  // Server count
  logInfo(`Stats: Currently in ${client.guilds.cache.size} servers with a combined amount of ${client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b)} members`)
  storeInfo('serverCount', client.guilds.cache.size)
  // Uptime
  if (!await getInfo('upSince')) storeInfo('upSince', Date.now()) // dont update if there is already a value
  // Bot ready
  storeInfo('botReady', (await getInfo('botReady') || 0) + 1)
}
