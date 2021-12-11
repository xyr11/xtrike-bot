const { MessageEmbed } = require('discord.js')
const Fuse = require('fuse.js')
const { botName, prefix, botColor, hasPerms } = require('../modules/base')

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
 * @param {import('../modules/sendMsg')} msg
 * @param {Array} args
 */
exports.run = async (msg, args) => {
  const { client } = msg

  // if there are no args, get the help info of the help command itself
  if (!args.length) args[0] = 'help'
  // get the first argument and search it up in the commands list
  const cmd = client.commands.get(args[0])

  // embed variable
  const embed = new MessageEmbed().setFooter(`${botName} v${process.env.npm_package_version}`)

  // check if that command doesn't exist or if they dont have proper permission levels
  if (!cmd || !hasPerms(cmd, msg)) {
    // fuzzy search for the given arguments
    const fuse = new Fuse(client.commands.map(a => a.info), { keys: ['name'] }) // search options
    const results = fuse.search(args[0]) // search
      .map(a => a.item.name) // get the command name only
      .filter(a => hasPerms(client.commands.get(a), msg)) // check if user has perms to view that command
    // create the embed
    embed.setColor(botColor).setDescription(`Sorry, we didn't find any commands with the name \`${args[0]}\`. `)
    if (results.length) embed.addField('Did you mean:', results.join('\n'))
    else embed.addField('Please try again', 'Make sure to check the spelling of the command.')
  } else {
    // create the embed
    const { name, description, usage, thumbnail, option, similar } = cmd.info
    embed.setColor(botColor)
      .setTitle(`${prefix}${name} command`)
      .setThumbnail(thumbnail ?? '')
      .setDescription(description.replace(/{{|}}/g, '')) // remove `{{` and `}}`
    if (usage) embed.addFields({ name: 'Usage', value: usage.replaceAll('$$', prefix) })
    if (option) embed.addFields({ name: 'Options', value: option })
    if (similar) embed.addFields({ name: 'Similar', value: similar.split(' ').join(', ').replaceAll('$$', prefix) })
  }
  msg.reply({ embeds: [embed] })
}
