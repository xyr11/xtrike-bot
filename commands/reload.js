const { Message } = require('discord.js') // eslint-disable-line no-unused-vars
const { prefix, time } = require('../config')
const chalk = require('chalk')

exports.info = {
  name: 'reload',
  category: 'Developer',
  description: 'Reload a command',
  usage: '`reload <command name>`',
  aliases: ['refresh'],
  permLevel: 'lmao',
  requiredArgs: true
}

// from https://github.com/AnIdiotsGuide/guidebot/ (commands/reload.js)
// License: MIT License (https://github.com/AnIdiotsGuide/guidebot/blob/master/LICENSE)
/**
 * @param {Message} message
 * @param {Array} args
 */
exports.run = (message, args) => {
  const client = message.client
  const commandName = args[0]

  // Check if the command exists and is valid
  if (!client.commands.has(commandName)) return message.reply('That command does not exist')

  delete require.cache[require.resolve(`./${commandName}.js`)]
  // We also need to delete and reload the command from the client.commands Enmap
  client.commands.delete(commandName)

  const props = require(`./${commandName}.js`)
  client.commands.set(commandName, props)
  message.reply(`The command \`${prefix}${commandName}\` has been reloaded`)
  console.log(chalk.green(`The command ${prefix}${commandName} has been reloaded (${time()})`))
}
