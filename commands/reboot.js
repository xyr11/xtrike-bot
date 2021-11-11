const { Message, Interaction } = require('discord.js') // eslint-disable-line no-unused-vars
const chalk = require('chalk')
const { presence, time } = require('../config')

exports.info = {
  name: 'reboot',
  category: 'Developer',
  description: 'Reboot',
  usage: '`$$reboot`',
  aliases: [],
  permLevel: 'lmao'
}

// from https://github.com/AnIdiotsGuide (commands/reboot.js)
// License: MIT License (https://github.com/AnIdiotsGuide/guidebot/blob/master/LICENSE)
/**
 * @param {Message} message
 * @param {Interaction} interaction
 */
exports.run = async (message, interaction) => {
  const client = message.client
  console.log(chalk.red(`Bot is shutting down. ${time()}  🤖`))
  await client.user.setActivity('none. Rebooting...', { type: presence.activityType })
  await message.reply('Bot is shutting down.')
  await Promise.all(client.commands.map(cmd => { // eslint-disable-line array-callback-return
    // the path is relative to the *current folder*, so just ./filename.js
    delete require.cache[require.resolve(`./${cmd.info.name}.js`)]
    // We also need to delete and reload the command from the container.commands Enmap
    client.commands.delete(cmd.info.name)
  }))
  process.exit(0)
}
