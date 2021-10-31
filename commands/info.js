const { prefix, colors } = require('../config')

exports.info = {
  name: 'info',
  category: 'Bot Info',
  description: 'Show information about the bot',
  usage: 'info',
  aliases: ['bot', 'version'],
  permLevel: 'User'
}

exports.run = (client, message, args) => {
  message.channel.send({
    embeds: [{
      color: colors.main,
      title: 'Xtrike Bot',
      description: 'Xtrike Bot is a multi-purpose bot by <@681766482304434187>',
      fields: [
        {
          name: '💬 Commands',
          value: `Prefix: \`${prefix}\` \nFor commands, type \`${prefix}commandName\`, case-insensitive`
        },
        {
          name: '🛠 Current Version',
          value: 'v0.1.3 [(bot has been rebooted!)](https://github.com/xyr11/xtrike-bot/blob/main/README.md)'
        },
        {
          name: 'ℹ More features coming soon!',
          value: '[See more info](https://github.com/xyr11/xtrike-bot/blob/main/README.md), visit the [GitHub repository](https://github.com/xyr11/xtrike-bot), or join the [support and dev server](https://discord.gg/x3F22hN)'
        }
      ]
    }]
  })
}
