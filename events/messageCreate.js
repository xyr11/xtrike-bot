// ? detect ALL new messages
const { prefix, getUserPerms, hasPerms } = require('../config')
const { saveMsg, sendErr } = require('../modules/errorCatch')
const { fetchImage } = require('../modules/getImage')

module.exports = (client, message) => {
  // Get images for the ;image command
  fetchImage(message)

  // Ignore all bots
  if (message.author.bot) return

  // Ignore messages not starting with the prefix
  if (message.content.indexOf(prefix) !== 0) return

  // Get command and arguments from the message
  const args = message.content.slice(prefix.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()

  // Grab the command data from client
  const cmd = client.commands.get(command)

  // If that command doesn't exist, silently exit and do nothing
  // If they dont have proper permLevels, do nothing too
  if (!cmd || !hasPerms(cmd.info.permLevel, message)) return

  message.channel.sendTyping() // bot is typing visual

  // Check if beta
  if (cmd.info.isBeta === true && getUserPerms(message) < 4) {
    message.reply('This command isn\'t really done yet, check back later.')
    return
  }

  // Run the command
  try {
    saveMsg(message) // save the current channel for error tracking
    if (cmd.info.requiredArgs === true && args.length === 0) {
      // Check if command requires arguments
      // If yes then return the help entry of the command instead and not the command itself
      client.commands.get('help').run(client, message, [cmd.info.name])
    } else {
      cmd.run(client, message, args)
    }
  } catch (error) {
    sendErr(error, client, message)
  }
}
