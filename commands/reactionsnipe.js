/**
 * pls reactionsnipe
 * Given by Dank Memer at https://github.com/DankMemer/sniper, MIT License
 */

const { Message, Interaction, MessageEmbed, ReactionEmoji, GuildEmoji } = require('discord.js') // eslint-disable-line no-unused-vars
const { sniper } = require('../modules/sniper')

exports.info = {
  name: 'reactionsnipe',
  category: 'General',
  thumbnail: 'https://imgur.com/dRSYp1f.png',
  description: 'Give the most recently removed reaction in the current or given channel.\n\n' +
    '{{[Graciously given by Dank Memer <3](https://github.com/DankMemer/sniper)}}',
  usage: '`$$reactionsnipe [channel]`',
  similar: '`$$snipe` `$$editsnipe`',
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
 * @param {import('../modules/sendMsg')} msg
 * @param {Array} args
 */
exports.run = async (msg, args) => {
  // if there is a specified channel then snipe from that channel, if
  // not then snipe from the current channel.
  // valid snowflakes have 17-20 numbers (see guides/snowflakes.md)
  const channelId = (args[0] && args[0].match(/(?<=<#)[0-9]{17,20}(?=>)/)[0]) ?? msg.channelId
  const channel = msg.guild.channels.cache.get(channelId)

  // check if the given channel is in the same guild
  if (!channel) return msg.reply("There's nothing to snipe!")

  // get reactionsnipe data
  /**
   * @typedef {Object} ReactRemove
   * @property {String} a Author id
   * @property {ReactionEmoji|GuildEmoji} e Emoji
   * @property {String} i Message id
   * @property {String} t Removed timestamp
   */
  /** @type {ReactRemove} */
  const reacted = await sniper('c', channelId)

  // if there's no value
  if (!reacted) return msg.reply("There's nothing to snipe!")

  /**
   * @param {ReactionEmoji|GuildEmoji} emoji
   * @returns Emoji string
   */
  const formatEmoji = emoji => !emoji.id || emoji.available
    ? emoji.s // bot has access or unicode emoji
    : `[:${emoji.name}:](${emoji.url})` // bot cannot use the emoji

  // create embed
  const msgUrl = `https://discord.com/channels/${msg.guildId}/${channelId}/${reacted.i}` // message url
  const author = await msg.client.users.fetch(reacted.a) // get author
  msg.reply({
    embeds: [new MessageEmbed()
      .setAuthor(author.tag, author.avatarURL(), msgUrl)
      .setColor(author.hexAccentColor)
      .setDescription(`reacted with ${formatEmoji(reacted.e)} on [this message](${msgUrl})`)
      .setFooter(`#${channel.name}`)
      .setTimestamp(reacted.t)]
  })
}
