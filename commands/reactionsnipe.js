const Discord = require('discord.js')
const { isChannel } = require('../modules/base')
const { sniper, maxSnipes, exceedMaxSnipesNotice } = require('../modules/sniper')

exports.info = {
  name: 'reactionsnipe',
  category: 'General',
  thumbnail: 'https://imgur.com/dRSYp1f.png',
  description: 'Get the most recently removed reactions.\n' +
    '{{[Graciously given by Dank Memer <3](https://github.com/DankMemer/sniper)}}',
  usage: '`$$reactionsnipe [number] [channel]`',
  option: `\`[number]\`: get the *nth* removed reaction, default is \`1\` (newest), max is \`${maxSnipes}\` (oldest) \n\`[channel]\`: channel to snipe`,
  aliases: ['reactsnipe'],
  similar: '`$$snipe` `$$editsnipe`',
  permLevel: 'User',
  dank: true,
  options: [
    { type: 4, name: 'number', description: 'The nth removed reaction' },
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

  // Fetch snipes
  /** @type {import('../modules/sniper').RemovedReaction} */
  //* (For older versions) Get reactionsnipe data
  let oldReacts = await sniper('c', channelId)
  //* (For newer versions) If reactionsnipe data is an array, get the index instead
  let content
  if (Array.isArray(oldReacts)) {
    // If user inputted a value larger than the max amount then add a notice in the message
    if (index > maxSnipes) content = exceedMaxSnipesNotice
    // If given index does not exist, give the last entry of the array (meaning the oldest one)
    oldReacts = oldReacts[index - 1] || oldReacts[0]
  }
  // Check if reactsnipe data exits
  if (!oldReacts) return msg.reply("There's nothing to snipe!")

  const react = {
    authorId: oldReacts.a,
    emoji: oldReacts.e,
    id: oldReacts.i,
    time: oldReacts.t
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
    content,
    embeds: [new Discord.MessageEmbed()
      .setAuthor({ name: author.tag, iconURL: author.avatarURL() })
      .setColor(author.hexAccentColor)
      .setDescription(`reacted with ${formatEmoji(react.emoji)} on [this message](https://discord.com/channels/${msg.guildId}/${channelId}/${react.id})`)
      .setFooter({ text: `#${channel.name}` })
      .setTimestamp(Number(react.time))]
  })
}
