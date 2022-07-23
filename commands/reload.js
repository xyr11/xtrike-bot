/**
 * Inspired by https://github.com/AnIdiotsGuide/guidebot (commands/reload.js)
 *
 * MIT License
 *
 * Copyright (c) 2018 YorkAARGH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const fs = require('fs')
const BotCmd = require('../class/botCmd')

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

module.exports = new BotCmd('reload')
  .setCategory('Developer')
  .setDescription('Reload')
  .setUsage('`$$reload <action>`')
  .setAliases(['refresh', 'load'])
  .requiredPerm('lmao')
  .isRequiredArgs()
  .callback(async (msg, args) => {
    const { prefix, presence } = require('../modules/base')

    const { client } = msg
    const commandName = args[0]

    try {
      // Name of the module that will be reloaded
      let reloadedName
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
        delete require.cache[require.resolve('../modules/errorCatch.js')] // delete cache
        require('../modules/errorCatch') // re-add the module
        reloadedName = 'The errorCatch module has been reloaded'
      } else if (commandName === 'module' && args[1]) {
        const path = `../modules/${args[1]}.js`
        // Check if module exists
        if (await doesExist(path)) return msg.reply('That module does not exist')
        // Reload the module
        if (require.resolve(path)) delete require.cache[require.resolve(path)] // delete cache
        require(path) // re-add the module
        reloadedName = `The ${args[1]}.js module has been reloaded`
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
  })
