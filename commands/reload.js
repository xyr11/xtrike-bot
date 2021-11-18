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

  try {
    // name of the module that will be reloaded
    let reloadedName = ''
    // Check if bot will reload autoresponses
    // from https://github.com/AnIdiotsGuide/guidebot/ (commands/reload.js), MIT License
    if (commandName === 'auto') {
      // reload all autoresponses
      client.autoresponses = []
      client.autoresponseNames = []
      for (const file of fs.readdirSync('./autoresponses').filter(file => file.endsWith('.js'))) {
        // delete cache
        delete require.cache[require.resolve(`../autoresponses/${file}`)]
        // re-add the module
        const autoresponse = require(`../autoresponses/${file}`)
        // add to arrays
        client.autoresponses.push(autoresponse)
        client.autoresponseNames.push(file.split('.')[0])
      }
      reloadedName = 'Autoresponses'
    } else if (commandName === 'err') {
      // delete cache
      delete require.cache[require.resolve('../modules/errorCatch.js')]
      // re-add the module
      require('../modules/errorCatch.js')
      reloadedName = 'The errorCatch module'
    } else {
      // Check if the command exists and is valid
      if (!client.commands.has(commandName)) return message.reply('That command does not exist')
      delete require.cache[require.resolve(`./${commandName}.js`)]
      // We also need to delete and reload the command from the client.commands Enmap
      client.commands.delete(commandName)
      // re-add the module
      const props = require(`./${commandName}.js`)
      client.commands.set(commandName, props)
      reloadedName = `The command \`${prefix}${commandName}\``
    }
    message.reply(`${reloadedName} has been reloaded`)
    console.log(chalk.green(`${reloadedName} has been reloaded (${time()})`))
  } catch (error) {
    await require('../modules/errorCatch')(error, message.client, message)
    await message.reply('I have encountered an error while trying to reload. \n⚠️ Because the reload command is very powerful, this error can cause massive disruption. Therefore, the bot will REBOOT shortly. ⚠️')
    process.exit(0)
  }
}
