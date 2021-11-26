const { Message } = require('discord.js') // eslint-disable-line no-unused-vars
const chalk = require('chalk')
const { presence, time } = require('../config')
const { storeInfo } = require('../modules/botInfo')

exports.info = {
  name: 'reboot',
  category: 'Developer',
  description: 'Reboot',
  usage: '`$$reboot`',
  aliases: [],
  permLevel: 'lmao'
}

// from https://github.com/AnIdiotsGuide (commands/reboot.js), MIT License
/** @param {Message} message */
exports.run = async message => {
  const client = message.client

  // log to console
  console.log(chalk.red('Bot is shutting down. 🤖'), chalk.bgRedBright.black(`(${time()})`))

  // set activity
  await client.user.setActivity('none. Rebooting...', { type: presence.activityType })

  // reply
  await message.reply('Bot is shutting down.')

  // remove upSince
  await storeInfo('upSince', null)

  await Promise.all(client.commands.map(cmd => { // eslint-disable-line array-callback-return
    // the path is relative to the current folder, so just ./filename.js
    delete require.cache[require.resolve(`./${cmd.info.name}.js`)]
    // We also need to delete and reload the command from the container.commands Enmap
    client.commands.delete(cmd.info.name)
  }))

  // exit
  process.exit(0)
}
