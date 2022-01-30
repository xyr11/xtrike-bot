const { storeInfo } = require('../modules/botInfo')
const { imgConfig } = require('../modules/getImage')

/** @param {import('discord.js').Guild} guild  */
exports.execute = async guild => {
  // Update server count
  storeInfo('serverCount', guild.client.guilds.cache.size)

  // Delete ;image command data
  await imgConfig.deactivate.server(guild.id)
}
