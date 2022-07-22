const { MessageEmbed } = require('discord.js')
const BotCmd = require('../class/botCmd')

module.exports = new BotCmd('info')
  .setCategory('Bot')
  .setDescription('Show information about the bot')
  .setUsage('`$$info`')
  .setAliases(['bot', 'version', 'information'])
  .requiredPerm('User')
  .callback(msg => {
    const { botName, botDescription, botColor, infoFields } = require('../modules/base')
    return msg.send({
      embeds: [new MessageEmbed()
        .setTitle(botName)
        .setColor(botColor)
        .setThumbnail(msg.client.user.avatarURL())
        .setDescription(botDescription)
        .addFields(infoFields)
      ]
    })
  })
