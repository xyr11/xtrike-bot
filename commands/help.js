const { Message, Interaction, MessageEmbed } = require('discord.js') // eslint-disable-line no-unused-vars
const Fuse = require('fuse.js')
const { prefix, colors, hasPerms } = require('../config')

exports.info = {
  name: 'help',
  category: 'Bot Info',
  description: 'Show what the different commands of the bot does',
  usage: '`$$help <command>`',
  aliases: ['help'],
  permLevel: 'User',
  options: [
    {
      type: 3,
      name: 'command',
      description: 'Command that you want to get help on',
      choices: []
    }
  ]
}

/**
 * @param {Message} message
 * @param {Interaction} interaction
 * @param {Array} args
 */
exports.run = async (message, interaction, args) => {
  const thing = message || interaction
  const client = thing.client

  // if there are no args, get the help command of the help command itself
  if (args.length === 0) args[0] = 'help'

  // if there are args, get the first argument and search it up in commands list
  const cmd = client.commands.get(args[0])

  // embed variable
  const embed = new MessageEmbed().setFooter(`Xtrike Bot v${process.env.npm_package_version}`)

  if (!cmd || !hasPerms(cmd, thing)) {
    // if that command doesn't exist or if they dont have proper permission levels
    const fuse = new Fuse(client.commands.map(a => a.info), { keys: ['name'] }) // search options
    const results = fuse.search(args[0]) // search
      .map(a => a.item.name) // get the command name only
      .filter(a => hasPerms(client.commands.get(a), thing)) // check if user has perms to view that command
    // set the embed
    embed.setColor(colors.main)
      .setDescription('Sorry, we didn\'t find any commands with\n' +
        `the name \`${args[0]}\`. ` + (
        results.length
          ? 'Did you mean:\n\n' + results.join('\n')
          : 'Please try again.'))
  } else {
    const { name, description, usage, thumbnail, option, similar } = cmd.info
    // set the embed
    embed.setColor(colors.main)
      .setTitle(`${prefix}${name} command`)
      .setThumbnail(thumbnail ?? '')
      .setDescription(description.replace(/{{|}}/g, '')) // remove `{{` and `}}`
    if (usage) embed.addFields({ name: 'Usage', value: usage.replaceAll('$$', prefix) })
    if (option) embed.addFields({ name: 'Options', value: option })
    if (similar) embed.addFields({ name: 'Similar', value: similar.split(' ').join(', ').replaceAll('$$', prefix) })
  }
  thing.reply({ embeds: [embed] })
}
