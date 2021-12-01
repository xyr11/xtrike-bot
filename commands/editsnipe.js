/**
 * pls editsnipe
 * Given by Dank Memer at https://github.com/DankMemer/sniper, MIT License
 */

const { Message, Interaction, MessageEmbed, MessageAttachment } = require('discord.js') // eslint-disable-line no-unused-vars
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
  if (!edited) return thing.reply("There's nothing to snipe!")

  // message url
  const editedUrl = `https://discord.com/channels/${thing.guildId}/${channelId}/${edited.i}`

  // get author
  const author = await thing.client.users.cache.get(edited.a)

  // create embed
  const embeds = []
  const files = []
  embeds.push(new MessageEmbed()
    .setAuthor(author.tag, author.avatarURL(), editedUrl)
    .setColor(author.hexAccentColor)
    .setDescription(edited.c +
      (edited.f.length ? ' [Message has attachments]' : '') + // if there are attachments
      (edited.e.length ? ' [Message has embeds, see below]' : '') + // if there are embeds
      ` [(go to original message)](${editedUrl})`)
    .setFooter(`#${channel.name}`)
    .setTimestamp(edited.t))
  // check if there are any removed embeds and include them
  if (edited.e) edited.e.forEach(e => embeds.push(e))
  // check if there are any deleted files
  if (edited.f.length === 1) embeds[0].setImage(edited.f[0])
  else if (edited.f.length > 1) edited.f.forEach(url => files.push(new MessageAttachment(url)))
  await thing.reply({ embeds, files })
}
