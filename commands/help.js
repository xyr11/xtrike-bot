const { MessageEmbed } = require('discord.js')
const Fuse = require('fuse.js')
let { botName, prefix, botColor, hasPerms } = require('../modules/base')

exports.info = {
  name: 'help',
  category: 'Bot',
  description: 'Show what the different commands of the bot does',
  usage: '`$$help [command or category]`',
  permLevel: 'User',
  options: [{ type: 3, name: 'command', description: 'Command or category to check out' }]
}

/**
 * @param {import('../class/sendMsg')} msg
 * @param {String[]} args
 */
exports.run = async (msg, args) => {
  const { client } = msg
  // input
  const input = args.length && args[0].toLowerCase()
  // list of commands
  /** @type {Map<String, {info: {name: String, category: String, thumbnail: String, description: String, usage: String, option: String, aliases: String[], similar: String[], permLevel: String, options: Array}, run: Function}>} */
  const commands = client.commands
  // list of categories
  const categories = [...new Set([...commands.values()].map(v => v.info.category.toLowerCase()))] // remove repeated entries
    .filter(g => g !== 'developer') // remove the developer category
  /** Function to capitalize words */
  const capitalize = str => str[0].toUpperCase() + str.slice(1)
  /** Function to fetch command from command name or command alias */
  const getCmd = name => commands.get(name) || commands.get([...commands.keys()].filter(i => commands.get(i).info.aliases && commands.get(i).info.aliases.indexOf(name) > -1)[0])

  // Embed variable
  const embed = new MessageEmbed().setColor(botColor).setFooter(`${botName} v${process.env.npm_package_version}`)

  // Change the prefix depending if the message is a slash command or not
  prefix = msg.isSlash ? '/' : prefix

  if (!input) {
    // There's no input
    const { description, usage } = exports.info
    // Add title, description, and bot avatar
    embed.setTitle('Commands Help').setDescription(description).setThumbnail(msg.client.user.avatarURL())
    // For each category, add an embed field
    for (const category of categories) {
      embed.addField(capitalize(category) + ' Commands', [...commands.values()]
        .filter(v => v.info.category.toLowerCase() === category) // list of commands in said category
        .map(v => `\`${prefix + v.info.name}\``).join(', ') // get the names of the command
      , true)
    }
    // Add the usage field
    embed.addField('Usage', usage.replaceAll('$$', prefix)) // replace `$$` to the bot prefix
  } else if (categories.indexOf(input) > -1) {
    // Input is a category
    // List commands that are in the category
    const categoryCommands = [...commands.values()].filter(v => v.info.category.toLowerCase() === input)
      .filter(v => hasPerms(v, msg)) // filter commands using user perm level
      .map(v => v.info) // get the info property only
    // Get the command name, description and usage
    const compiled = categoryCommands.map(v => `**- ${v.name}**\n` +
      `${v.description.replace(/{{|}}/g, '').replace(/\.?\s?\n.+/s, '')}\n` + // remove `{{` and `}}` and all extra lines
      `${v.usage.replaceAll('$$', prefix).replace(/\.?\s?\n.+/s, '')}`) // replace `$$` to the bot prefix and remove all extra lines
    // Add to embed
    embed.setTitle(capitalize(input) + ' Category') // add the category name as title and capitalize it
      .setDescription(compiled.join('\n\n')) // add the array of compiled descriptions
  } else if (getCmd(input) && hasPerms(getCmd(input), msg)) {
    // Input is a bot command
    const cmd = getCmd(input)
    // Create the embed
    const { name, description, category, thumbnail, usage, aliases, option, similar } = cmd.info
    embed.setTitle(`${prefix}${name} command`).setThumbnail(thumbnail)
      .setDescription(description.replace(/{{|}}/g, '')) // remove `{{` and `}}`
    if (usage) embed.addField('Usage', usage.replaceAll('$$', prefix)) // replace `$$` to the bot prefix
    if (category) embed.addField('Category', `${capitalize(category)}`, true)
    if (aliases) embed.addField('Aliases', aliases.map(n => `\`${prefix}${n}\``).join(', '), true)
    if (option) embed.addField('Options', option)
    if (similar) embed.addField('Similar', similar.split(' ').join(', ').replaceAll('$$', prefix))
  } else {
    // Input is neither a command or a category
    const commandNames = commands.map(a => a.info.name) // get command names
    commands.forEach(a => a.info.aliases && commandNames.push(...a.info.aliases)) // get command aliases
    // Fuzzy search
    const results = new Fuse(commandNames).search(input)
      .map(a => a.item) // get the command name only
      .filter(a => getCmd(a) && hasPerms(getCmd(a), msg)) // check if user has perms to view that command
      .slice(0, 6) // get the first 6 entries
    // Create the embed
    embed.setDescription(`Sorry, we didn't find any commands with the name \`${args[0]}\`. `)
    if (results.length) embed.addField('Did you mean:', results.join('\n'))
    else embed.addField('Please try again', 'Make sure to check the spelling of the command.')
  }

  // Send the embed
  msg.reply({ embeds: [embed] })
}
