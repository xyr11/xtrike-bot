/**
 * pls editsnipe
 * Graciously given by Dank Memer <3
 * https://github.com/DankMemer/sniper
 * under the MIT License
 */

const { Message, MessageEmbed } = require('discord.js') // eslint-disable-line no-unused-vars
const { editSnipes } = require('../modules/sniper')

exports.info = {
  name: 'editsnipe',
  category: 'General',
  thumbnail: 'https://imgur.com/dRSYp1f.png',
  description: 'Give the original message of the most recently edited one in the current or given channel.\n\n' +
    '[Graciously given by Dank Memer <3](https://github.com/DankMemer/sniper)',
  usage: '`$$editsnipe [channel]`',
  similar: '`$$snipe` `$$reactionsnipe`',
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
  const edit = editSnipes()[channel.id]

  // if there's no value
  if (!edit) return message.reply("There's nothing to snipe!")

  // get user
  const author = await message.client.users.cache.get(edit.id)

  // create embed
  const embed = new MessageEmbed()
    .setAuthor(edit.author, author.avatarURL(), edit.url)
    .setColor(author.hexAccentColor)
    .setFooter(`#${message.channel.name}`)
    .setTimestamp(edit.time)
  if (edit.content) embed.setDescription(edit.content)
  if (edit.attachments.length > 0) embed.setImage(edit.attachments[0])
  await message.reply({ embeds: [embed] })
}
