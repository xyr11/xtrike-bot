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
  description: 'Snipe deleted messages.\n\n' +
    '[Graciously given by Dank Memer <3](https://github.com/DankMemer/sniper)',
  usage: '`snipe`\n`editsnipe`\n`reactionsnipe`',
  permLevel: 'User',
  dank: true
}

exports.run = async (message, args) => {
  // by default, it will choose the current channel
  // if there is a specified channel, it will choose that channel
  const channel = args[0] || message.channel
  // get the snipe data
  const snipe = snipes()[channel.id]

  // if there's no value
  if (!snipe) return message.reply("There's nothing to snipe!")

  // create embed
  const embed = new MessageEmbed()
    .setAuthor(snipe.author, snipe.avatar)
    .setColor(snipe.color)
    .setFooter(`#${message.channel.name}`)
    .setTimestamp(snipe.time)
  if (snipe.content) embed.setDescription(snipe.content)
  if (snipe.image) embed.setImage(snipe.image)
  await message.reply({ embeds: [embed] })
}
