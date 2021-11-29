const { Message, Interaction } = require('discord.js') // eslint-disable-line no-unused-vars

exports.info = {
  name: 'oxford',
  category: 'Commands',
  description: 'Get the definition of a word from Oxford Dictionary.',
  usage: 'oxford <word>',
  permLevel: 'User',
  isBeta: true
}

/**
 * @param {Message} message
 * @param {Interaction} interaction
 */
exports.run = async (message, interaction) => {
  // code
  (message || interaction).reply('A')
}
