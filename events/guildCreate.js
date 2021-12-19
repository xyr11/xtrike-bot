const chalk = require('chalk')
const { storeInfo } = require('../modules/botInfo')

/** @param {import('discord.js').Guild} guild  */
exports.execute = async guild => {
  console.log(chalk.blue('Someone added me in a new server!'))
  storeInfo('serverCount', guild.client.guilds.cache.size)
}
