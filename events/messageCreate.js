// ? detect ALL new messages
const { Message } = require('discord.js') // eslint-disable-line no-unused-vars
const { prefix, getUserPerms, hasPerms } = require('../config')
const { sendErr } = require('../modules/errorCatch')
const { fetchImage } = require('../modules/getImage')

/** @param {Message} message */
exports.execute = message => {
  const client = message.client

  // Get images for the ;image command
  fetchImage(message)

  // Ignore all bots
  if (message.author.bot) return

  // for commands that start with 'pls'
  const dank = message.content.split(/ +/g)[0] === 'pls'

  // Ignore messages not starting with the prefix
  if (message.content.indexOf(prefix) !== 0 && !dank) return

  // Get command and arguments from the message
  let args = message.content.slice(prefix.length).trim().split(/ +/g)
  let command = args.shift().toLowerCase()
  if (dank) {
    args = message.content.split(/ +/g).splice(0, 2)
    command = message.content.split(/ +/g)[1]
  }

  // Grab the command data from client
  const cmd = client.commands.get(command)

  // If that command doesn't exist, silently exit and do nothing
  // If they dont have proper permLevels, do nothing too
  if (!cmd || !hasPerms(cmd, message)) return

  message.channel.sendTyping() // bot is typing visual

  // Check if beta
  if (cmd.info.isBeta === true && getUserPerms(message) < 4) {
    message.reply('This command isn\'t really done yet, check back later.')
    return
  }

  // Run the command
  try {
    if (cmd.info.requiredArgs === true && args.length === 0) {
      // Check if command requires arguments
      // If yes then return the help entry of the command instead and not the command itself
      client.commands.get('help').run(message, [cmd.info.name])
    } else if (dank && cmd.info.dank) {
      cmd.run(message, args)
    } else if (!dank) {
      cmd.run(message, args)
    }
  } catch (error) {
    sendErr(error, client, message)
  }
}
