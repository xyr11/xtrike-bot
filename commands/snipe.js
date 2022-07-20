const { MessageEmbed } = require('discord.js')
const zlib = require('zlib')
const { isChannel } = require('../modules/base')
const { sniper, maxSnipes, exceedMaxSnipesNotice } = require('../modules/sniper')

exports.info = {
  name: 'snipe',
  category: 'General',
  thumbnail: 'https://imgur.com/dRSYp1f.png',
  description: 'Get the most recently deleted messages.\n' +
    '{{[Graciously given by Dank Memer <3](https://github.com/DankMemer/sniper)}}',
  usage: '`$$snipe [number] [channel]`',
  option: `\`[number]\`: get the *nth* deleted message, default is \`1\` (newest), max is \`${maxSnipes}\` (oldest) \n\`[channel]\`: channel to snipe`,
  similar: '`$$editsnipe` `$$reactionsnipe`',
  permLevel: 'User',
  dank: true,
  options: [
    { type: 4, name: 'number', description: 'The nth deleted message' },
    { type: 7, name: 'channel', description: 'Channel to snipe' }
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
  // If there are no given index or index is less than 1
  if (!index || index < 1) index = 1

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

  // Fetch snipes
  /** @type {import('../modules/sniper').Deleted} */
  //* (For older versions) Get snipe data object
  let deletes = await sniper('a', channelId)
  //* (For newer versions) If snipe data is an array, get the value inside the array
  let content
  if (Array.isArray(deletes)) {
    // If user inputted a value larger than the max amount then add a notice in the message
    if (index > maxSnipes) content = exceedMaxSnipesNotice
    // If given index does not exist, give the last entry of the array (meaning the oldest one)
    deletes = deletes[index - 1] || deletes[deletes.length - 1] // we need to minus one since arrays are zero-based
  }
  // Check if sniped data exists
  if (!deletes) return msg.reply("There's nothing to snipe!")

  const del = {
    authorId: deletes.a,
    content: deletes.c,
    time: deletes.t,
    embeds: deletes.e || [],
    attachments: deletes.f || [],
    attachmentBuffers: deletes.m || [],
    repliedOn: deletes.r
  }

  // Create message
  const author = await msg.client.users.fetch(del.authorId) // get author
  const embeds = []
  const files = []

  embeds.push(new MessageEmbed()
    .setAuthor({ name: author.tag, iconURL: author.avatarURL() })
    .setColor(author.hexAccentColor)
    .setDescription(
      (del.repliedOn ? `*Replying to [this message](https://discord.com/channels/${msg.guildId}/${msg.channelId}/${del.repliedOn}):*\n` : '') + // if message is a reply
      del.content +
      (!del.content && del.embeds.length ? ' *[has embeds]*' : '') + // if there are embeds and there is no message content
      (del.attachments.length ? ' *[has attachments]*' : '')) // if there are attachments
    .setFooter({ text: `#${channel.name}` })
    .setTimestamp(Number(del.time)))
  // Check if there are sniped embeds
  if (del.embeds) del.embeds.forEach(e => embeds.push(e))

  // Check if there are sniped files
  if (del.attachments.length) {
    for (const url of del.attachments) {
      // Check if the attachment url has a saved buffer
      if (del.attachmentBuffers[url]) {
        // Get mongodb binary
        // Check https://mongodb.github.io/node-mongodb-native/api-bson-generated/binary.html
        const binary = del.attachmentBuffers[url]
        // Convert it to buffer
        const compressedBuf = binary.read(0, binary.length())
        // Decompress the buffer
        const rawBuffer = await zlib.gunzipSync(compressedBuf)
        // Push the file
        files.push({ attachment: rawBuffer, name: url.match(/[^/]+$/)[0] })
      } else {
        // If there are no saved buffers then just push the url
        files.push(url)
      }
    }
  }

  await msg.reply({ content, embeds, files })
}
