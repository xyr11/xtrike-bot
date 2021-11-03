const { MessageEmbed } = require('discord.js')
const { prefix, colors, hasPerms } = require('../config')

exports.info = {
  name: 'help',
  category: 'Bot Info',
  description: 'Show what the different commands of the bot does',
  usage: '`help <command>`',
  aliases: ['help'],
  permLevel: 'User'
}

exports.run = async (client, message, args) => {
  // if there are no args, get the help command of the help command itself
  if (args.length === 0) args[0] = 'help'

  // if there are args, get the first argument and search it up in commands list
  const cmd = client.commands.get(args[0])

  // if that command doesn't exist, silently exit and do nothing
  // if they dont have proper permLevels, do nothing too
  // todo: if that command doesn't exist, say that that command doesn't exist / add those "did you mean x?" stuff in the future
  if (!cmd || !hasPerms(cmd, message)) {
    message.reply({
      embeds: [{
        color: colors.main,
        description: 'Sorry, we didn\'t find any command with\n' +
          `the name \`${args[0]}\`. Please try again.`,
        footer: { text: `Xtrike Bot v${process.env.npm_package_version}` }
      }]
    })
    return
  }

  const { name, description, usage, thumbnail } = cmd.info

  const bot = await client.user.fetch() // for the bot avatar
  const embed = new MessageEmbed()
    .setColor(colors.main)
    .setTitle(`${prefix}${name} command`)
    .setThumbnail(thumbnail ?? '')
    .setDescription(description)
    .setFooter(`Xtrike Bot v${process.env.npm_package_version}`, bot.avatarURL())
  if (usage) embed.addFields({ name: 'Usage', value: usage.replace(/^`/gm, '`' + prefix) })
  message.channel.send({ embeds: [embed] })
}
