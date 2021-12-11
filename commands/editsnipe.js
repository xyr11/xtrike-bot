/**
 * pls editsnipe
 * Given by Dank Memer at https://github.com/DankMemer/sniper, MIT License
 */

const { MessageEmbed, MessageAttachment } = require('discord.js')
const { sniper } = require('../modules/sniper')

exports.info = {
  name: 'editsnipe',
  category: 'General',
  thumbnail: 'https://imgur.com/dRSYp1f.png',
  description: 'Give the original message of the most recently edited one in the current or given channel.\n\n' +
    '{{[Graciously given by Dank Memer <3](https://github.com/DankMemer/sniper)}}',
  usage: '`$$editsnipe [channel]`',
  similar: '`$$snipe` `$$reactionsnipe`',
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

  // get editSnipe data
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
  const edited = await sniper('b', channelId)

  // if there's no value
  if (!edited) return msg.reply("There's nothing to snipe!")

  // create embed
  const msgUrl = `https://discord.com/channels/${msg.guildId}/${channelId}/${edited.i}` // message url
  const author = await msg.client.users.fetch(edited.a) // get author
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
  // check if there are any removed embeds and include them
  if (edited.e) edited.e.forEach(e => embeds.push(e))
  // check if there are any deleted files
  if (edited.f.length === 1) embeds[0].setImage(edited.f[0])
  else if (edited.f.length > 1) edited.f.forEach(url => files.push(new MessageAttachment(url)))
  await msg.reply({ embeds, files })
}
