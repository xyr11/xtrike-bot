const { storeInfo } = require('../modules/botInfo')
const { logInfo } = require('../modules/logger')

/** @param {import('discord.js').Guild} guild  */
exports.execute = async guild => {
  logInfo('Someone added me in a new server!')
  storeInfo('serverCount', guild.client.guilds.cache.size)
}
