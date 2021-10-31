// ? detect ALL new messages
const { prefix, hasPerms } = require('../config')
const errorCatch = require('../modules/errorCatch')

module.exports = (client, message) => {
  // Ignore all bots
  if (message.author.bot) return

  // Ignore messages not starting with the prefix
  if (message.content.indexOf(prefix) !== 0) return

  // get command and arguments innit
  const args = message.content.slice(prefix.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()

  // grab the command data from client
  const cmd = client.commands.get(command)

  // if that command doesn't exist, silently exit and do nothing
  // if they dont have proper permLevels, do nothing too
  if (!cmd || !hasPerms(cmd.info.permLevel, message)) return

  // run command
  message.channel.sendTyping() // bot is typing visual
  try {
    cmd.run(client, message, args)
  } catch (error) {
    errorCatch(error, client, message)
  }
}
