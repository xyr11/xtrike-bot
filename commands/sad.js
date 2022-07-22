
const BotCmd = require('../class/botCmd')

module.exports = new BotCmd('sad')
  .setCategory('Random')
  .setDescription(`Let ${require('../modules/base').botName} cheer you if you're sad!`)
  .setUsage('`$$sad`')
  .requiredPerm('User')
  .callback(msg => msg.reply(`Hey ${msg.author.username}, there's no room to be sad. Cheering on you through the hard times! <3`))
