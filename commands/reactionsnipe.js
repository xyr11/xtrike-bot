/**
 * pls reactionsnipe
 * Graciously given by Dank Memer <3
 * https://github.com/DankMemer/sniper
 * under the MIT License
 */

const { Message, Interaction, MessageEmbed } = require('discord.js') // eslint-disable-line no-unused-vars
const { reactionSnipes } = require('../modules/sniper')

exports.info = {
  name: 'reactionsnipe',
  category: 'General',
  thumbnail: 'https://imgur.com/dRSYp1f.png',
  description: 'Give the most recently removed reaction in the current or given channel.\n\n' +
    '{{[Graciously given by Dank Memer <3](https://github.com/DankMemer/sniper)}}',
  usage: '`$$reactionsnipe [channel]`',
  similar: '`$$snipe` `$$editsnipe`',
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
  const reaction = reactionSnipes()[channel.id]

  // if there's no value
  if (!reaction) return message.reply("There's nothing to snipe!")

  // get user
  const author = await message.client.users.cache.get(reaction.id)

  // format emoji
  const formatEmoji = emoji => {
    return !emoji.id || emoji.available
      ? emoji.toString() // bot has access or unicode emoji
      : `[:${emoji.name}:](${emoji.url})` // bot cannot use the emoji
  }

  // create embed
  const embed = new MessageEmbed()
    .setAuthor(reaction.author, author.avatarURL(), reaction.url)
    .setColor(author.hexAccentColor)
    .setDescription(`reacted with ${formatEmoji(reaction.emoji)} on [this message](${reaction.url})`)
    .setFooter(`#${message.channel.name}`)
    .setTimestamp(reaction.time)
  await message.reply({ embeds: [embed] })
}
