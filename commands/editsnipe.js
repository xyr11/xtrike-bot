/**
 * pls editsnipe
 * Graciously given by Dank Memer <3
 * https://github.com/DankMemer/sniper
 * under the MIT License
 */

const { Message, Interaction, MessageEmbed } = require('discord.js') // eslint-disable-line no-unused-vars
const { editSnipes } = require('../modules/sniper')

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

  // get the snipe data
  const edit = editSnipes()[channel]

  // if there's no value
  if (!edit) return thing.reply("There's nothing to snipe!")

  // get user
  const author = await thing.client.users.cache.get(edit.id)

  // create embed
  const embeds = []
  embeds.push(new MessageEmbed()
    .setAuthor(edit.author, author.avatarURL(), edit.url)
    .setColor(author.hexAccentColor)
    .setDescription((edit.content ?? '[Message has no content]') + (edit.embeds.length ? ' [Message has embeds, see below]' : ''))
    .setFooter(`#${thing.channel.name}`)
    .setTimestamp(edit.time))
  if (edit.attachments.length > 0) embeds[0].setImage(edit.attachments[0])
  // check if there are any removed embeds and include them
  if (edit.embeds) edit.embeds.forEach(e => embeds.push(e))
  await thing.reply({ embeds })
}
