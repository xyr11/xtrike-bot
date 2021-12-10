const { CommandInteraction } = require('discord.js') // eslint-disable-line no-unused-vars
const { userPerms, hasPerms } = require('../modules/base')
const recordStats = require('../modules/recordStatistics')

/** @param {CommandInteraction} interaction */
exports.execute = async interaction => {
  if (!interaction.isCommand()) return
  const { client } = interaction

  // get command
  const cmd = client.commands.get(interaction.commandName)

  // if that command doesn't exist, silently exit and do nothing
  // if they dont have proper permLevels, do nothing too
  if (!cmd || !hasPerms(cmd, interaction)) return

  // check if beta
  if (cmd.info.isBeta && userPerms(interaction) < 4) {
    return interaction.reply('This command isn\'t really done yet, check back later.')
  }

  // create args from interaction.options
  const args = []
  for (const option of interaction.options.data) {
    const { name, type, value } = option
    // if the option is a boolean and the value is true, add the option name in the args
    if (type === 'BOOLEAN' && value) args.push(name)
    // if the name is a flag (i.e. "--flag"), then add both the option name and value
    else if (name.search('--') === 0) args.push(name, ...value.toString().split(/ +/g))
    // if the option is a number, convert to string
    else if (type === 'INTEGER' || type === 'NUMBER') args.push(value + '') // split each words using spaces
    // if the option is a channel, convert it to the `<#channelId>` format
    else if (option.channel) args.push(`<#${value}>`)
    // if the option is a user, convert it to the `<@id>` format
    else if (option.user) args.push(`<@${value}>`)
    // if the option is a role, convert it to the `<@&id>` format
    else if (option.role) args.push(`<@&${value}>`)
    // if the option is a string, add the option value
    else if (type === 'STRING') args.push(...value.split(/ +/g)) // split each words using spaces
  }
  // add the content property on `interaction` for commands that need it
  interaction.content = `/${interaction.commandName} ${args.join(' ')}`

  while (true) {
    try {
      // execute command
      await cmd.run(null, interaction, args)
      return recordStats(cmd.info.name) // record statistics
    } catch (error) {
      // retry if "Unknown Interaction" error
      // if not then throw an error and log it
      if (error.message !== 'Unknown Interaction') return require('../modules/errorCatch')(error, client, null, interaction)
    }
  }
}
