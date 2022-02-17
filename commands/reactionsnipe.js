const Discord = require('discord.js')
const { isChannel } = require('../modules/base')
const { sniper } = require('../modules/sniper')

exports.info = {
  name: 'reactionsnipe',
  category: 'General',
  thumbnail: 'https://imgur.com/dRSYp1f.png',
  description: 'Get the most recently removed reactions.\n' +
    '{{[Graciously given by Dank Memer <3](https://github.com/DankMemer/sniper)}}',
  usage: '`$$reactionsnipe [number] [channel]`',
  option: '`[number]`: Get the *nth* removed reaction, default is `1` (most recent) and max is `50` \n `[channel]`: the channel to get deleted messages (optional)',
  aliases: ['reactsnipe'],
  similar: '`$$snipe` `$$editsnipe`',
  permLevel: 'User',
  dank: true,
  options: [
    { type: 4, name: 'number', description: 'Get the nth removed reaction' },
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

  /** @type {import('../modules/sniper').RemovedReaction} */
  //* (For older versions) Get reactionsnipe data
  let removedReacts = await sniper('c', channelId)
  //* (For newer versions) If reactionsnipe data is an array, get the index instead
  if (Array.isArray(removedReacts)) removedReacts = removedReacts[index - 1] || removedReacts[0]
  // Check if reactsnipe data exits
  if (!removedReacts) return msg.reply("There's nothing to snipe!")

  const react = {
    authorId: removedReacts.a,
    emoji: removedReacts.e,
    id: removedReacts.i,
    time: removedReacts.t
  }

  /**
   * @param {Discord.ReactionEmoji|Discord.GuildEmoji} emoji
   * @returns Emoji string
   */
  const formatEmoji = emoji => !emoji.id || emoji.available
    ? emoji.s // bot has access or unicode emoji
    : `[:${emoji.name}:](${emoji.url})` // bot cannot access emoji

  // Create embed
  const author = await msg.client.users.fetch(react.authorId, { force: true }) // get author
  msg.reply({
    embeds: [new Discord.MessageEmbed()
      .setAuthor({ name: author.tag, iconURL: author.avatarURL() })
      .setColor(author.hexAccentColor)
      .setDescription(`reacted with ${formatEmoji(react.emoji)} on [this message](https://discord.com/channels/${msg.guildId}/${channelId}/${react.id})`)
      .setFooter({ text: `#${channel.name}` })
      .setTimestamp(Number(react.time))]
  })
}
