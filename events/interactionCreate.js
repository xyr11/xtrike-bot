const { Interaction } = require('discord.js') // eslint-disable-line no-unused-vars

/** @param {Interaction} interaction */
exports.execute = async interaction => {
  if (!interaction.isCommand()) return
  console.log(interaction)

  // a
  interaction.reply('Sorry, but slash commands are still on beta!')
}
