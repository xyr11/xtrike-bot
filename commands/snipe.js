/**
 * pls snipe
 * Graciously given by Dank Memer <3
 * https://github.com/DankMemer/sniper
 * under the MIT License
 */

const { Message, Interaction, MessageEmbed } = require('discord.js') // eslint-disable-line no-unused-vars
const { snipes } = require('../modules/sniper')

exports.info = {
  name: 'snipe',
  category: 'General',
  thumbnail: 'https://imgur.com/dRSYp1f.png',
  description: 'Get the most recently deleted message in the current or given channel.\n\n' +
    '{{[Graciously given by Dank Memer <3](https://github.com/DankMemer/sniper)}}',
  usage: '`$$snipe [channel]`',
  similar: '`$$editsnipe` `$$reactionsnipe`',
  permLevel: 'User',
  dank: true,
  options: [
    {
      type: 7, // text channel
      name: 'channel',
      description: 'The channel to snipe'
    }
  ]
}

/**
 * @param {Message} message
 * @param {Interaction} interaction
 * @param {Array} args
 */
exports.run = async (message, interaction, args) => {
  // by default, it will choose the current channel
  // if there is a specified channel, it will choose that channel
  const channel = interaction
    // if slash command
    ? (args.options.getChannel('channel') || args.channel)
    // if normal message
    : (args[0] && args[0].match(/(?<=<#)[0-9]{18}(?=>)/gm)
        ? { id: args[0].match(/(?<=<#)[0-9]{18}(?=>)/gm)[0] }
        : message.channel)

  // get the snipe data
  const deleted = snipes()[channel.id]

  // if there's no value
  if (!deleted) return message.reply("There's nothing to snipe!")

  console.log(deleted)

  // get user
  const author = await message.client.users.cache.get(deleted.id)

  // create embed
  const embed = new MessageEmbed()
    .setAuthor(deleted.author, author.avatarURL())
    .setColor(author.hexAccentColor)
    .setFooter(`#${message.channel.name}`)
    .setTimestamp(deleted.time)
  if (deleted.content) embed.setDescription(deleted.content)
  if (deleted.attachments.length > 0) embed.setImage(deleted.attachments[0])
  await message.reply({ embeds: [embed] })
}
