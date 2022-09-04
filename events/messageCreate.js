const SendMsg = require('../class/sendMsg')
const { prefix, userPerms, hasPerms } = require('../modules/base')
const errorCatch = require('../modules/errorCatch')
const recordStats = require('../modules/recordStatistics')

/** @param {import('discord.js').Message} message */
exports.execute = async message => {
  // Get variables from message
  const msg = new SendMsg(message)
  const { client, author, content } = msg
  // regex to check for the prefix, supports newlines before and spaces after the prefix
  const prefixRegex = new RegExp(`\\s*${prefix} *`)

  // Ignore bots
  if (author.bot) return

  // Trigger all autoresponses
  for (const autoresponse of client.autoresponses) autoresponse(message)

  // Ignore messages with no content
  if (!content) return
  // Check if message starts with 'pls'
  const dank = content.search(/\s*pls +/) === 0
  // Ignore messages not starting with the prefix
  if (content.search(prefixRegex) !== 0 && !dank) return

  // Get command and arguments from the message
  const args = content.replace(new RegExp(`\\s*(${prefix}|pls) *`), '').split(/ +/g) // remove the prefix
  // If there are no arguments then return
  if (!args.length) return

  // Get the command name and remove it from the `args`
  /** @type {import('discord.js').Collection<String, {info: Object, run: Function}>} */
  const commands = client.commands
  const commandName = args.shift().toLowerCase()
  // Get the command
  let cmd = commands.get(commandName)
  // Get the command via command aliases
  if (!cmd) cmd = commands.get([...commands.keys()].filter(i => commands.get(i).info.aliases && commands.get(i).info.aliases.indexOf(commandName) > -1)[0])

  // Checks
  // If that command doesn't exist or if they dont have proper permLevels, silently exit and do nothing
  if (!cmd || !hasPerms(cmd, message)) return
  // If message starts with 'pls' but dank mode is not enabled in command, return
  if (dank && !cmd.info.dank) return
  // Check if command is in beta
  if (cmd.info.isBeta && userPerms(message) < 4) return message.reply('This command isn\'t really done yet, check back later.')

  // Run the command
  try {
    message.channel.sendTyping()
    // If the command requires arguments and there are no given arguments, return the help embed
    if (cmd.info.requiredArgs && !args.length) await client.commands.get('help').run(msg, [cmd.info.name])
    else await cmd.run(msg, args)
    recordStats(cmd.info.name)
  } catch (error) {
    errorCatch(error, client, msg)
  }
}
