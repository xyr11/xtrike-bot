const { Message } = require('discord.js') // eslint-disable-line no-unused-vars
const { prefix, colors } = require('../config')

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
 */
exports.run = message => {
  message.channel.send({
    embeds: [{
      color: colors.main,
      title: 'Xtrike Bot',
      description: 'Xtrike Bot is a multi-purpose bot by \n<@681766482304434187>',
      fields: [
        {
          name: ':speech_balloon: Commands',
          value: `Prefix: \`${prefix}\` \nFor commands, type \`${prefix}commandName\`.\n` +
            `To get help, enter \`${prefix}help commandName\``
        },
        {
          name: ':tools: Current Version',
          value: `Version ${process.env.npm_package_version}`
        },
        {
          name: ':information_source: More features coming soon!',
          value: '[See more info](https://github.com/xyr11/xtrike-bot/blob/main/README.md), visit the [GitHub repository](https://github.com/xyr11/xtrike-bot), \nor join the [support and dev server](https://discord.gg/x3F22hN)'
        }
      ]
    }]
  })
}
