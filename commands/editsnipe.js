const { MessageEmbed } = require('discord.js')
const { isChannel } = require('../modules/base')
const { sniper } = require('../modules/sniper')

exports.info = {
  name: 'editsnipe',
  category: 'General',
  thumbnail: 'https://imgur.com/dRSYp1f.png',
  description: 'Get the original message of the most recently edited messages.\n' +
    '{{[Graciously given by Dank Memer <3](https://github.com/DankMemer/sniper)}}',
  usage: '`$$editsnipe [number] [channel]`',
  option: '`[number]`: Get the *nth* edited message, default is `1` (most recent) and max is `50` \n `[channel]`: the channel to get deleted messages.',
  similar: '`$$snipe` `$$reactionsnipe`',
  permLevel: 'User',
  dank: true,
  options: [
    { type: 4, name: 'number', description: 'Get the nth edited message' },
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

  /** @type {import('../modules/sniper').Edited} */
  //* (For older versions) Get editsnipe data object
  let edits = await sniper('b', channelId)
  //* (For newer versions) If editsnipe data is an array, get the value inside the array
  if (Array.isArray(edits)) edits = edits[index - 1] || edits[0]
  // Check if editsnipe data exits
  if (!edits) return msg.reply("There's nothing to snipe!")

  const edit = {
    authorId: edits.a,
    content: edits.c,
    id: edits.i,
    time: edits.t,
    embeds: edits.e || [],
    attachments: edits.f || [],
    repliedOn: edits.r
  }

  // Create embed
  const msgUrl = `https://discord.com/channels/${msg.guildId}/${channelId}/${edit.id}` // message url
  const author = await msg.client.users.fetch(edit.authorId, { force: true }) // get author
  const embeds = []
  const files = []
  embeds.push(new MessageEmbed()
    .setAuthor({ name: author.tag, iconURL: author.avatarURL() })
    .setColor(author.hexAccentColor)
    .setDescription(
      (edit.repliedOn ? `*Replying to [this message](https://discord.com/channels/${msg.guildId}/${msg.channelId}/${edit.repliedOn}):*\n` : '') + // if message is a reply
      edit.content +
      (!edit.content && edit.embeds.length ? ' *[has embeds]*' : '') + // if there are embeds and there is no message content
      (edit.attachments.length ? ' *[has attachments]*' : '') + // if there are attachments
      ` [(go to original message)](${msgUrl})`)
    .setFooter({ text: `#${channel.name}` })
    .setTimestamp(Number(edit.time)))
  // Check if there are sniped embeds
  if (edit.embeds) edit.embeds.forEach(e => embeds.push(e))
  // Check if there are sniped files
  if (edit.attachments.length) edit.attachments.forEach(url => files.push(url))
  await msg.reply({ embeds, files })
}
