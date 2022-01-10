const SendMsg = require('../class/sendMsg')
const { userPerms, hasPerms } = require('../modules/base')
const errorCatch = require('../modules/errorCatch')
const recordStats = require('../modules/recordStatistics')

/** @param {import('discord.js').CommandInteraction} interaction */
exports.execute = async interaction => {
  if (!interaction.isCommand()) return
  // Set to SendMsg class
  const msg = new SendMsg(interaction)
  const { client } = msg

  // Get command
  const cmd = client.commands.get(msg.message.commandName)

  // If that command doesn't exist, silently exit and do nothing
  // If they dont have proper permLevels, do nothing too
  if (!cmd || !hasPerms(cmd, msg)) return

  // Check if beta
  if (cmd.info.isBeta && userPerms(msg) < 4) return msg.reply('This command isn\'t really done yet, check back later.')

  // Create args from the given options
  const args = []
  for (const option of msg.options.data) {
    const { name, type, value } = option
    // If the option is a boolean and the value is true, add the option name in the args
    if (type === 'BOOLEAN' && value) args.push(name)
    // If the name is a flag (i.e. "--flag"), then add both the option name and value
    else if (name.search('--') === 0) args.push(name, ...value.toString().split(/ +/g))
    // If the option is a number, convert to string
    else if (type === 'INTEGER' || type === 'NUMBER') args.push(value + '') // split each words using spaces
    // If the option is a channel, convert it to the `<#channelId>` format
    else if (option.channel) args.push(`<#${value}>`)
    // If the option is a user, convert it to the `<@id>` format
    else if (option.user) args.push(`<@${value}>`)
    // If the option is a role, convert it to the `<@&id>` format
    else if (option.role) args.push(`<@&${value}>`)
    // If the option is a string, add the option value
    else if (type === 'STRING') args.push(...value.split(/ +/g)) // split each words using spaces
  }
  // Add the text equivalent of the application command options
  msg.setContent(`/${msg.commandName} ${args.join(' ')}`)

  while (true) {
    try {
      // Execute command
      await cmd.run(msg, args)
      return recordStats(cmd.info.name) // Record statistics
    } catch (error) {
      // Retry if "Unknown Interaction" error
      // If not then throw an error and log it
      if (error.message !== 'Unknown Interaction') return errorCatch(error, client, msg)
    }
  }
}
