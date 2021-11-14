const { Message } = require('discord.js') // eslint-disable-line no-unused-vars
const { prefix, getUserPerms, hasPerms } = require('../config')

/** @param {Message} message */
exports.execute = message => {
  const client = message.client

  // Never acknowledge your own message
  if (message.author.id === client.user.id) return

  // Trigger all autoresponses
  for (const i of client.autoresponses) i(message)

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
    args = message.content.split(/ +/g)
    args.splice(0, 2)
    command = message.content.split(/ +/g)[1]
  }
  // Grab the command data from client
  const cmd = client.commands.get(command)

  // If that command doesn't exist, silently exit and do nothing
  // If they dont have proper permLevels, do nothing too
  if (!cmd || !hasPerms(cmd, message)) return

  // Check if beta
  if (cmd.info.isBeta === true && getUserPerms(message) < 4) {
    message.reply('This command isn\'t really done yet, check back later.')
    return
  }

  // Run the command
  try {
    if (cmd.info.requiredArgs === true && args.length === 0) {
      // If the command requires arguments and there are no given arguments then return the help entry instead
      message.channel.sendTyping()
      client.commands.get('help').run(message, null, [cmd.info.name])
    } else if (!dank || (dank && cmd.info.dank)) {
      // Check if command is a dank command and accepts 'pls'
      message.channel.sendTyping()
      cmd.run(message, null, args)
    }
  } catch (error) {
    require('../modules/errorCatch')(error, client, message)
  }
}
