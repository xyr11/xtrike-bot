const { Interaction } = require('discord.js') // eslint-disable-line no-unused-vars
const { userPerms, hasPerms } = require('../modules/base')
const recordStats = require('../modules/recordStatistics')

/** @param {Interaction} interaction */
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
  for (const o of interaction.options.data) {
    // if the option is a boolean and the value is true, add the option name in the args
    if (o.type === 'BOOLEAN' && o.value) args.push(o.name)
    // if the option is a string, add the option value
    else if (o.type === 'STRING') args.push(...o.value.split(/ +/g)) // split each words using spaces
    // if the option is a number, convert to string
    else if (o.type === 'INTEGER' || o.type === 'NUMBER') args.push(o.value + '') // split each words using spaces
    // if the option is a channel, convert it to the `<#channelId>` format
    else if (o.channel) args.push(`<#${o.value}>`)
    // if the option is a user, convert it to the `<@id>` format
    else if (o.user) args.push(`<@${o.value}>`)
    // if the option is a role, convert it to the `<@id>` format
    else if (o.role) args.push(`<@&${o.value}>`)
  }
  // add the content property on `inteaction` for commands that need it
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
