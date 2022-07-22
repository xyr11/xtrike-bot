const BotCmd = require('../class/botCmd')

module.exports = new BotCmd('hmm')
  .setCategory('Random')
  .setDescription('hmm...')
  .setUsage('`$$hmm`')
  .setAliases('hmmm', 'hmmmm', 'hmmmmm')
  .interactionOptions({ type: 3, name: 'text', description: 'Extra text' })
  .callback(msg => msg.send(`${msg.author} ${msg.text ? msg.text + ' ' : ''}hmmmm... 🤔`))
