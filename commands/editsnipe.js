/**
 * pls editsnipe
 * Given by Dank Memer at https://github.com/DankMemer/sniper, MIT License
 */

const { MessageEmbed, MessageAttachment } = require('discord.js')
const { isChannel } = require('../modules/base')
const { sniper } = require('../modules/sniper')

exports.info = {
  name: 'editsnipe',
  category: 'General',
  thumbnail: 'https://imgur.com/dRSYp1f.png',
  description: 'Get the original message of the most recently edited messages.\n' +
    '{{[Graciously given by Dank Memer <3](https://github.com/DankMemer/sniper)}}',
  usage: '`$$editsnipe [number] [channel]`',
  option: '`[number]`: Get the *nth* edited message, default is `1` (most recent) and max is `10` \n `[channel]`: the channel to get deleted messages.',
  similar: '`$$snipe` `$$reactionsnipe`',
  permLevel: 'User',
  dank: true,
  options: [
    { type: 4, name: 'number', description: 'Get the nth edited message' },
    { type: 7, name: 'channel', description: 'The channel to snipe' }
  ]
}

/**
 * @param {import('../modules/sendMsg')} msg
 * @param {Array} args
 */
exports.run = async (msg, args) => {
  await msg.setDefer() // set defer

  // Get the nth deleted message
  let index = !isNaN(args[0]) ? +Math.floor(args[0]) : undefined
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
  // Check if the given channel is in the same guild
  if (!channel) return msg.reply("There's nothing to snipe!")

  // Get editsnipe data
  const edits = await sniper('b', channelId)
  // If there's no value
  if (!edits && !edits.length) return msg.reply("There's nothing to snipe!")

  /**
   * @typedef {Object} Edited
   * @property {String} a Author id
   * @property {String} c Message old content
   * @property {Array} e Old embeds
   * @property {Array} f Old file attachments
   * @property {String} i Message id
   * @property {String} t Edited timestamp
   */
  /** @type {Edited} */
  // Get the edited entry
  let edited = edits
  // If editsnipe data is an array, get the index instead
  if (Array.isArray(edits)) edited = edits[index - 1] || edits[0]

  // Remove non-rich embeds
  edited.e = edited.e.filter(e => e.type === 'rich')

  // Create embed
  const msgUrl = `https://discord.com/channels/${msg.guildId}/${channelId}/${edited.i}` // message url
  const author = await msg.client.users.fetch(edited.a, { force: true }) // get author
  const embeds = []
  const files = []
  embeds.push(new MessageEmbed()
    .setAuthor(author.tag, author.avatarURL(), msgUrl)
    .setColor(author.hexAccentColor)
    .setDescription(edited.c +
      (edited.f.length ? ' [Message has attachments]' : '') + // if there are attachments
      (edited.e.length ? ' [Message has embeds, see below]' : '') + // if there are embeds
      ` [(go to original message)](${msgUrl})`)
    .setFooter(`#${channel.name}`)
    .setTimestamp(edited.t))
  // Check if there are any removed embeds and include them
  if (edited.e) edited.e.forEach(e => embeds.push(e))
  // Check if there are any deleted files
  if (edited.f.length === 1) embeds[0].setImage(edited.f[0])
  else if (edited.f.length > 1) edited.f.forEach(url => files.push(new MessageAttachment(url)))
  await msg.reply({ embeds, files })
}
