const { Message, Interaction, MessageEmbed } = require('discord.js') // eslint-disable-line no-unused-vars
const { botName, botDescription, botColor, infoFields } = require('../modules/base')

exports.info = {
  name: 'info',
  category: 'Bot Info',
  description: 'Show information about the bot.',
  usage: '`$$info`',
  aliases: ['bot', 'version'],
  permLevel: 'User'
}

/**
 * @param {Message} message
 * @param {Interaction} interaction
 */
exports.run = (message, interaction) => {
  (message || interaction).reply({
    embeds: [new MessageEmbed()
      .setTitle(botName)
      .setColor(botColor)
      .setThumbnail((message || interaction).client.user.avatarURL())
      .setDescription(botDescription)
      .addFields(infoFields)
    ]
  })
}
