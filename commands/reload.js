const { Message, Interaction } = require('discord.js') // eslint-disable-line no-unused-vars
const chalk = require('chalk')
const fs = require('fs')
const { prefix, time } = require('../config')

exports.info = {
  name: 'reload',
  category: 'Developer',
  description: 'Reload a command',
  usage: '`$$reload <command name>`',
  aliases: ['refresh'],
  permLevel: 'lmao',
  requiredArgs: true
}

/**
 * @param {Message} message
 * @param {Interaction} interaction
 * @param {Array} args
 */
exports.run = async (message, interaction, args) => {
  const client = message.client
  const commandName = args[0]

  // Check if bot will reload autoresponses
  if (commandName === 'auto') {
    // reload all autoresponses
    client.autoresponses = []
    client.autoresponseNames = []
    for (const file of fs.readdirSync('./autoresponses').filter(file => file.endsWith('.js'))) {
      // delete require cache
      delete require.cache[require.resolve(`../autoresponses/${file}`)]
      // re-add the module
      const autoresponse = require(`../autoresponses/${file}`)
      // add to arrays
      client.autoresponses.push(autoresponse)
      client.autoresponseNames.push(file.split('.')[0])
    }

    message.reply('Autoresponses have been reloaded')
    console.log(chalk.green(`Autoresponses have been reloaded (${time()})`))
    return
  }

  // from https://github.com/AnIdiotsGuide/guidebot/ (commands/reload.js)

  // MIT License (https://github.com/AnIdiotsGuide/guidebot/blob/master/LICENSE)
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
