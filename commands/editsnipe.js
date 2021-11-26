/**
 * pls editsnipe
 * Given by Dank Memer at https://github.com/DankMemer/sniper, MIT License
 */

const { Message, Interaction, MessageEmbed } = require('discord.js') // eslint-disable-line no-unused-vars
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

  // by default, it will choose the current channel
  // if there is a specified channel, it will choose that channel
  const channel = (args[0] && args[0].match(/[0-9]{18}/)[0]) ?? thing.channel.id

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
  const edited = await sniper('b', channel)

  // if there's no value
  if (!edited) return thing.reply("There's nothing to snipe!")

  // message url
  const editedUrl = `https://discord.com/channels/${thing.guildId}/${channel}/${edited.i}`

  // get author
  const author = await thing.client.users.cache.get(edited.a)

  // create embed
  const embeds = []
  embeds.push(new MessageEmbed()
    .setAuthor(author.tag, author.avatarURL(), editedUrl)
    .setColor(author.hexAccentColor)
    .setDescription((edited.c || '[Message has no content]') +
      (edited.e.length ? ' [Message has embeds, see below]' : '') +
      (edited.e.length > 9 ? ' [Too many embeds, only 9 will be shown]' : '') +
      ` [(go to original message)](${editedUrl})`)
    .setFooter(`#${thing.client.channels.cache.get(channel).name}`)
    .setTimestamp(edited.t))
  if (edited.f.length > 0) embeds[0].setImage(edited.f[0])
  // check if there are any removed embeds and include them
  if (edited.e) edited.e.slice(0, 9).forEach(e => embeds.push(e))
  await thing.reply({ embeds })
}
