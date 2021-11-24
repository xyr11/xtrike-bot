const { Message, Interaction } = require('discord.js') // eslint-disable-line no-unused-vars
const chalk = require('chalk')
const fs = require('fs')
const { prefix, time } = require('../config')

exports.info = {
  name: 'reload',
  category: 'Developer',
  description: 'Reload a command',
  usage: '`$$reload <command>`',
  aliases: ['refresh', 'load'],
  permLevel: 'lmao',
  requiredArgs: true
}

/**
 * check if file exists
 * @param {fs.PathLike} filePath path of the file
 * @returns {Boolean|undefined}
 */
const doesExist = async filePath => {
  try {
    await fs.promises.access(filePath)
    return true
  } catch (err) {}
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
    let reloadedName
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
      reloadedName = 'All autoresponses have been reloaded'
    } else if (commandName === 'err') {
      // delete cache
      delete require.cache[require.resolve('../modules/errorCatch.js')]
      // re-add the module
      require('../modules/errorCatch.js')
      reloadedName = 'The errorCatch module has been reloaded'
    } else {
      const fileExists = await doesExist(`./commands/${commandName}.js`)
      // Check if the command can be found in client.commands
      if (!client.commands.has(commandName)) {
        // check if file of the command exists
        if (!fileExists) return message.reply('That command does not exist')
        // add the module
        const props = require(`./${commandName}.js`)
        client.commands.set(commandName, props)
        reloadedName = `The command \`${prefix}${commandName}\` has been successfully loaded`
      } else {
        // delete the command on client.commands
        client.commands.delete(commandName)
        // check if file of the command is deleted
        if (!fileExists) return message.reply('Command has been deleted')
        // delete cache
        delete require.cache[require.resolve(`./${commandName}.js`)]
        // re-add the module
        const props = require(`./${commandName}.js`)
        client.commands.set(commandName, props)
        reloadedName = `The command \`${prefix}${commandName}\` has been reloaded`
      }
    }
    message.reply(reloadedName)
    console.log(chalk.green(reloadedName), chalk.bgGreenBright.black(time()))
  } catch (error) {
    await require('../modules/errorCatch')(error, message.client, message)
    await message.reply('I have encountered an error while trying to reload. \n⚠️ Because the reload command is very powerful, this error can cause massive disruption. Therefore, the bot will REBOOT shortly. ⚠️')
    process.exit(0)
  }
}
