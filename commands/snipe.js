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
  const thing = message || interaction

  // by default, it will choose the current channel
  // if there is a specified channel, it will choose that channel
  const channel = (args[0] && args[0].match(/[0-9]{18}/)[0]) ?? thing.channel.id

  // get the snipe data
  const deleted = snipes()[channel]

  // if there's no value
  if (!deleted) return thing.reply("There's nothing to snipe!")

  // get user
  const author = await thing.client.users.cache.get(deleted.id)

  // create embed
  const embeds = []
  embeds.push(new MessageEmbed()
    .setAuthor(deleted.author, author.avatarURL())
    .setColor(author.hexAccentColor)
    .setDescription((deleted.content ?? '[Message has no content]') + (deleted.embeds.length ? ' [Message has embeds, see below]' : ''))
    .setFooter(`#${thing.channel.name}`)
    .setTimestamp(deleted.time))
  if (deleted.attachments.length > 0) embeds[0].setImage(deleted.attachments[0])
  // check if there are any deleted embeds and include them
  if (deleted.embeds) deleted.embeds.forEach(e => embeds.push(e))
  await thing.reply({ embeds })
}
