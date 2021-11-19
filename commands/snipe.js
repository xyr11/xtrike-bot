/**
 * pls snipe
 * Graciously given by Dank Memer <3
 * https://github.com/DankMemer/sniper
 * under the MIT License
 */

const { Message, Interaction, MessageEmbed } = require('discord.js') // eslint-disable-line no-unused-vars
const { sniper } = require('../modules/sniper')

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

  // get snipe data
  /**
   * @typedef {Object} Deleted
   * @property {String} a Author id
   * @property {String} c Message content
   * @property {Array} e Embeds
   * @property {Array} f File attachments
   * @property {String} t Created timestamp
   */
  /** @type {Deleted} */
  const deleted = await sniper('a', channel)

  // if there's no value
  if (!deleted) return thing.reply("There's nothing to snipe!")

  // get author
  const author = await thing.client.users.cache.get(deleted.a)

  // create embed
  const embeds = []
  embeds.push(new MessageEmbed()
    .setAuthor(author.tag, author.avatarURL())
    .setColor(author.hexAccentColor)
    .setDescription((deleted.c || '[Message has no content]') +
      (deleted.e.length ? ' [Message has embeds, see below]' : '') +
      (deleted.e.length > 9 ? ' [Too many embeds, only 9 will be shown]' : ''))
    .setFooter(`#${thing.client.channels.cache.get(channel).name}`)
    .setTimestamp(deleted.t))
  if (deleted.f.length > 0) embeds[0].setImage(deleted.f[0])
  // check if there are any deleted embeds and include them
  if (deleted.e) deleted.e.slice(0, 9).forEach(e => embeds.push(e))
  await thing.reply({ embeds })
}
