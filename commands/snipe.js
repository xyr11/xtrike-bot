/**
 * pls snipe
 * Given by Dank Memer at https://github.com/DankMemer/sniper, MIT License
 */

const { Message, Interaction, MessageEmbed, MessageAttachment, GuildChannel } = require('discord.js') // eslint-disable-line no-unused-vars
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

  // if there is a specified channel then snipe from that channel, if
  // not then snipe from the current channel.
  // valid snowflakes have 17-20 numbers (see guides/snowflakes.md)
  const channelId = (args[0] && args[0].match(/(?<=<#)[0-9]{17,20}(?=>)/)[0]) ?? thing.channel.id
  const channel = thing.guild.channels.cache.get(channelId)

  // check if the given channel is in the same guild
  if (!channel) return thing.reply("There's nothing to snipe!")

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
  const deleted = await sniper('a', channelId)

  // if there's no value
  if (!deleted) return thing.reply("There's nothing to snipe!")

  // get author
  const author = await thing.client.users.cache.get(deleted.a)

  // create message
  const embeds = []
  const files = []
  embeds.push(new MessageEmbed()
    .setAuthor(author.tag, author.avatarURL())
    .setColor(author.hexAccentColor)
    .setDescription(deleted.c +
      (deleted.f.length ? ' [Message has attachments]' : '') + // if there are attachments
      (deleted.e.length ? ' [Message has embeds]' : '')) // if there are embeds
    .setFooter(`#${channel.name}`)
    .setTimestamp(deleted.t))
  // check if there are any deleted embeds and include them
  if (deleted.e) deleted.e.forEach(e => embeds.push(e))
  // check if there are any deleted files
  if (deleted.f.length === 1) embeds[0].setImage(deleted.f[0])
  else if (deleted.f.length > 1) deleted.f.forEach(url => files.push(new MessageAttachment(url)))
  await thing.reply({ embeds, files })
}
