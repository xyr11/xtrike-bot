const { Interaction } = require('discord.js') // eslint-disable-line no-unused-vars
const { userPerms, hasPerms } = require('../modules/base')
const recordStats = require('../modules/recordStatistics')

/** @param {Interaction} interaction */
exports.execute = async interaction => {
  if (!interaction.isCommand()) return
  const { client } = interaction

  const cmd = client.commands.get(interaction.commandName)

  // If that command doesn't exist, silently exit and do nothing
  // If they dont have proper permLevels, do nothing too
  if (!cmd || !hasPerms(cmd, interaction)) return

  // Check if beta
  if (cmd.info.isBeta === true && userPerms(interaction) < 4) {
    interaction.reply('This command isn\'t really done yet, check back later.')
    return
  }

  // create args from interaction.options
  const args = []
  // this grabs the options into "/image words: test --server: true --all: true"
  // and makes it into ";image --server --all test"
  for (const o of interaction.options._hoistedOptions) {
    if (o.name.search('--') === 0 && o.value) args.push(o.args)
    else {
      if (o.type === 'STRING') o.value.split(/ +/g).forEach(e => args.push(e))
      else if (o.type === 'CHANNEL') args.push(`<#${o.value}>`)
      else args.push(o.value)
    }
  }
  interaction.content = `/${interaction.commandName} ${args.join(' ')}`

  try {
    cmd.run(null, interaction, args)
    recordStats(cmd.info.name)
  } catch (error) {
    require('../modules/errorCatch')(error, client, null, interaction)
  }
}
