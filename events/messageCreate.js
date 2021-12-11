const SendMsg = require('../modules/sendMsg')
const { prefix, userPerms, hasPerms } = require('../modules/base')
const errorCatch = require('../modules/errorCatch')
const recordStats = require('../modules/recordStatistics')

/** @param {import('discord.js').Message} message */
exports.execute = async message => {
  // set to SendMsg class
  const msg = new SendMsg(message)
  const { client, author, content } = msg

  // never acknowledge your own message
  if (author.id === client.user.id) return

  // trigger all autoresponses
  for (const runAutoresponse of client.autoresponses) runAutoresponse(message)

  // ignore bots and messages with no content
  if (author.bot || !content) return

  // Check if message starts with 'pls'
  const dank = content.split(/ +/g)[0].toLowerCase() === 'pls'

  // Ignore messages not starting with the prefix
  if (content[0] !== prefix && !dank) return

  // Get command and arguments from the message
  const args = !dank
    ? content.slice(prefix.length).trim().split(/ +/g) // remove the prefix
    : content.split(/ +/g).slice(1) // remove the 'pls' word
  if (!args.length) return
  const command = args.shift().toLowerCase()

  // Grab the command data
  const cmd = client.commands.get(command)
  // If that command doesn't exist, silently exit and do nothing
  // If they dont have proper permLevels, do nothing too
  if (!cmd || !hasPerms(cmd, message)) return
  // Check if beta
  if (cmd.info.isBeta && userPerms(message) < 4) {
    return message.reply('This command isn\'t really done yet, check back later.')
  }
  // If message starts with 'pls' but dank mode is not enabled in command, return
  if (dank && !cmd.info.dank) return

  // Run the command
  try {
    message.channel.sendTyping()
    if (cmd.info.requiredArgs && !args.length) await client.commands.get('help').run(msg, [cmd.info.name]) // if the command requires arguments and there are no given arguments, return the help embed
    else await cmd.run(msg, args)
    recordStats(cmd.info.name)
  } catch (error) {
    errorCatch(error, client, msg)
  }
}
