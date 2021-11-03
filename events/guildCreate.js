const { Guild } = require('discord.js') // eslint-disable-line no-unused-vars
const chalk = require('chalk')

/** @param {Guild} guild  */
exports.execute = guild => {
  console.log(chalk.blue('Someone added me in a new server!'))
}
