/**
 * pls snipe
 * Graciously given by Dank Memer <3
 * https://github.com/DankMemer/sniper
 * under the MIT License
 */

const { Message, MessageEmbed } = require('discord.js') // eslint-disable-line no-unused-vars
const { snipes } = require('../modules/sniper')

exports.info = {
  name: 'snipe',
  category: 'General',
  thumbnail: 'https://imgur.com/dRSYp1f.png',
  description: 'Get the most recently deleted message in the current or given channel.\n\n' +
    '[Graciously given by Dank Memer <3](https://github.com/DankMemer/sniper)',
  usage: '`$$snipe [channel]`',
  similar: '`$$editsnipe` `$$reactionsnipe`',
  permLevel: 'User',
  dank: true
}

/**
 * @param {Message} message
 * @param {Array} args
 */
exports.run = async (message, args, isSlash = false) => {
  // by default, it will choose the current channel
  // if there is a specified channel, it will choose that channel
  const channel = isSlash
    // if slash command
    ? (args.options.getChannel('channel') || args.channel)
    // if normal message
    : (args[0] && args[0].match(/(?<=<#)[0-9]{18}(?=>)/gm)
        ? { id: args[0].match(/(?<=<#)[0-9]{18}(?=>)/gm)[0] }
        : message.channel)

  // get the snipe data
  const snipe = snipes()[channel.id]

  // if there's no value
  if (!snipe) return message.reply("There's nothing to snipe!")

  // get user
  const author = await message.client.users.cache.get(snipe.id)

  // create embed
  const embed = new MessageEmbed()
    .setAuthor(snipe.author, author.avatarURL())
    .setColor(author.hexAccentColor)
    .setFooter(`#${message.channel.name}`)
    .setTimestamp(snipe.time)
  if (snipe.content) embed.setDescription(snipe.content)
  if (snipe.image) embed.setImage(snipe.image)
  await message.reply({ embeds: [embed] })
}
