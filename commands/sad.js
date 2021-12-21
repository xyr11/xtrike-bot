const { botName } = require('../modules/base')

exports.info = {
  name: 'sad',
  category: 'Random',
  description: `Let ${botName} cheer you if you're sad!`,
  usage: '`$$sad`',
  permLevel: 'User'
}

/** @param {import('../modules/sendMsg')} msg */
exports.run = msg => msg.reply(`Hey ${msg.author.username}, there's no room to be sad. Cheering on you through the hard times! <3`)
