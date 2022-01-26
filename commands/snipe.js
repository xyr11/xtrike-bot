/**
 * pls snipe
 * Given by Dank Memer at https://github.com/DankMemer/sniper, MIT License
 */

const { MessageEmbed, MessageAttachment } = require('discord.js')
const { isChannel } = require('../modules/base')
const { sniper } = require('../modules/sniper')

exports.info = {
  name: 'snipe',
  category: 'General',
  thumbnail: 'https://imgur.com/dRSYp1f.png',
  description: 'Get the most recently deleted messages.\n' +
    '{{[Graciously given by Dank Memer <3](https://github.com/DankMemer/sniper)}}',
  usage: '`$$snipe [number] [channel]`',
  option: '`[number]`: Get the *nth* deleted message, default is `1` (most recent) and max is `10` \n `[channel]`: the channel to get deleted messages.',
  similar: '`$$editsnipe` `$$reactionsnipe`',
  permLevel: 'User',
  dank: true,
  options: [
    { type: 4, name: 'number', description: 'Get the nth deleted message' },
    { type: 7, name: 'channel', description: 'The channel to snipe' }
  ]
}

/**
 * @param {import('../class/sendMsg')} msg
 * @param {Array} args
 */
exports.run = async (msg, args) => {
  await msg.setDefer() // set defer

  // Get the nth deleted message
  let index = !isNaN(args[0]) ? Math.floor(args[0]) : undefined
  // If given index is less than 1
  if (index && index < 1) index = 1

  // If there is a specified channel then snipe from that channel, if not then snipe from the current channel
  let channelId = msg.channelId
  // Channel is in the 2nd arg
  if (index && args[1]) channelId = isChannel(args[1]) ?? channelId
  // There's no `number` value, so channel is in the 1st arg
  if (!index && args[0]) channelId = isChannel(args[0]) ?? channelId

  // Find the channel in the guild
  const channel = msg.guild.channels.cache.get(channelId)
  // check if the given channel is in the same guild
  if (!channel) return msg.reply("There's nothing to snipe!")

  // Get snipe data
  const deletes = await sniper('a', channelId)
  if (!deletes || !deletes.length) return msg.reply("There's nothing to snipe!")

  /**
   * @typedef {Object} Deleted
   * @property {String} a Author id
   * @property {String} c Message content
   * @property {Array} e Embeds
   * @property {Array} f File attachments
   * @property {String} t Created timestamp
   */
  /** @type {Deleted} */
  // Get the deleted entry
  let deleted = deletes
  // If snipe data is an array, get the index instead
  if (Array.isArray(deletes)) deleted = deletes[index - 1] || deletes[0]

  // Remove non-rich embeds
  deleted.e = deleted.e.filter(e => e.type === 'rich')

  // Create message
  const author = await msg.client.users.fetch(deleted.a, { force: true }) // get author
  const embeds = []
  const files = []
  embeds.push(new MessageEmbed()
    .setAuthor({ name: author.tag, iconURL: author.avatarURL() })
    .setColor(author.hexAccentColor)
    .setDescription(deleted.c +
      (deleted.f.length ? ' [Message has attachments]' : '') + // if there are attachments
      (deleted.e.length ? ' [Message has embeds]' : '')) // if there are embeds
    .setFooter({ text: `#${channel.name}` })
    .setTimestamp(deleted.t))
  // Check if there are any deleted embeds and include them
  if (deleted.e) deleted.e.forEach(e => embeds.push(e))
  // Check if there are any deleted files
  if (deleted.f.length === 1) embeds[0].setImage(deleted.f[0])
  else if (deleted.f.length > 1) deleted.f.forEach(url => files.push(new MessageAttachment(url)))
  await msg.reply({ embeds, files })
}
