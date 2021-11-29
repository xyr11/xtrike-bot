const { Message, Interaction } = require('discord.js') // eslint-disable-line no-unused-vars
const { prefix, colors } = require('../modules/base')

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
    embeds: [{
      color: colors.main,
      title: 'Xtrike Bot',
      description: 'Xtrike Bot is a multi-purpose bot by <@681766482304434187>',
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
