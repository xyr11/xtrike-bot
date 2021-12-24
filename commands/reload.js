const fs = require('fs')
const { prefix, presence } = require('../modules/base')

exports.info = {
  name: 'reload',
  category: 'Developer',
  description: 'Reload',
  usage: '`$$reload <action>`',
  aliases: ['refresh', 'load'],
  permLevel: 'lmao',
  requiredArgs: true
}

/**
 * Check if file exists
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
 * @param {import('../modules/sendMsg')} msg
 * @param {String[]} args
 */
exports.run = async (msg, args) => {
  const { client } = msg
  const commandName = args[0]

  try {
    // Name of the module that will be reloaded
    let reloadedName
    // Check if bot will reload autoresponses
    // From https://github.com/AnIdiotsGuide/guidebot/ (commands/reload.js), MIT License
    if (commandName === 'auto') {
      // Reload all autoresponses
      client.autoresponses = []
      client.autoresponseNames = []
      for (const file of fs.readdirSync('./autoresponses').filter(file => file.endsWith('.js'))) {
        // Delete cache
        delete require.cache[require.resolve(`../autoresponses/${file}`)]
        // Re-add the module
        const autoresponse = require(`../autoresponses/${file}`)
        // Add to arrays
        client.autoresponses.push(autoresponse)
        client.autoresponseNames.push(file.split('.')[0])
      }
      reloadedName = 'All autoresponses have been reloaded'
    } else if (commandName === 'err') {
      // Reload the errorCatch module
      // Delete cache
      delete require.cache[require.resolve('../modules/errorCatch.js')]
      // Re-add the module
      require('../modules/errorCatch.js')
      reloadedName = 'The errorCatch module has been reloaded'
    } else if (commandName === 'activity' && args[1]) {
      // Reload the presence activity
      if (['PLAYING', 'LISTENING', 'WATCHING'].indexOf(args[1].toUpperCase()) > -1 && args[2]) {
        // If args[1] is a valid activity type, use it
        client.user.setActivity(args.slice(2).join(' '), { type: args[1].toUpperCase() })
      } else {
        // Use the whole args[] on the activity text
        client.user.setActivity(args.slice(1).join(' '), { type: presence.activityType || 'PLAYING' })
      }
      reloadedName = 'The presence activity of the bot has been reloaded'
    } else {
      const fileExists = await doesExist(`./commands/${commandName}.js`)
      // Check if the command can be found in client.commands
      if (!client.commands.has(commandName)) {
        // Check if file of the command exists
        if (!fileExists) return msg.reply('That command does not exist')
        // Add the module
        const props = require(`./${commandName}.js`)
        client.commands.set(commandName, props)
        reloadedName = `The command \`${prefix}${commandName}\` has been successfully loaded`
      } else {
        // Delete the command on client.commands
        client.commands.delete(commandName)
        // Check if file of the command is deleted
        if (!fileExists) return msg.reply('Command has been deleted')
        // Delete cache
        delete require.cache[require.resolve(`./${commandName}.js`)]
        // Re-add the module
        const props = require(`./${commandName}.js`)
        client.commands.set(commandName, props)
        reloadedName = `The command \`${prefix}${commandName}\` has been reloaded`
      }
    }
    msg.reply(reloadedName)
    msg.good(reloadedName)
  } catch (error) {
    await require('../modules/errorCatch')(error, client, msg)
    await msg.reply('I have encountered an error while trying to reload. \n⚠️ Because the reload command is very powerful, this error can cause massive disruption. Therefore, the bot will REBOOT shortly. ⚠️')
    process.exit(0)
  }
}
