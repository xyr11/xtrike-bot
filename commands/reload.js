const { time } = require('../config')
const chalk = require('chalk')

exports.info = {
  name: 'reload',
  category: 'Developer',
  description: '',
  usage: '`reload [command]`',
  aliases: ['refresh'],
  permLevel: 'lmao'
}

// from https://github.com/AnIdiotsGuide/guidebot/ (commands/reload.js)
// License: MIT License (https://github.com/AnIdiotsGuide/guidebot/blob/master/LICENSE)
exports.run = (client, message, args) => {
  if (!args || args.length < 1) return message.reply('Must provide a command name to reload.')
  const commandName = args[0]
  // Check if the command exists and is valid
  if (!client.commands.has(commandName)) return message.reply('That command does not exist')

  delete require.cache[require.resolve(`./${commandName}.js`)]
  // We also need to delete and reload the command from the client.commands Enmap
  client.commands.delete(commandName)

  const props = require(`./${commandName}.js`)
  client.commands.set(commandName, props)
  message.reply(`The command ${commandName} has been reloaded`)
  console.log(chalk.green(`The command ${commandName} has been reloaded (${time()})`))
}
