const { MessageEmbed } = require('discord.js')
const { botName, botDescription, botColor, infoFields } = require('../modules/base')

exports.info = {
  name: 'info',
  category: 'Bot Info',
  description: 'Show information about the bot.',
  usage: '`$$info`',
  aliases: ['bot', 'version', 'information'],
  permLevel: 'User'
}

/** @param {import('../modules/sendMsg')} msg */
exports.run = msg => msg.send({
  embeds: [new MessageEmbed()
    .setTitle(botName)
    .setColor(botColor)
    .setThumbnail(msg.client.user.avatarURL())
    .setDescription(botDescription)
    .addFields(infoFields)
  ]
})
