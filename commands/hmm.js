const { Message, Interaction } = require('discord.js') // eslint-disable-line no-unused-vars

exports.info = {
  name: 'hmm',
  category: 'General',
  description: 'Reply with "hmm..."',
  usage: '`$$hmm [extra text]`',
  aliases: ['hmmm', 'hmmmm', 'hmmmmm', 'hmmmmmm'],
  permLevel: 'User',
  options: [
    {
      type: 3,
      name: 'text',
      description: 'Add extra text',
      choices: []
    }
  ]
}

/**
 * @param {Message} message
 * @param {Interaction} interaction
 * @param {Array} args
 */
exports.run = async (message, interaction, args) => {
  if (!args.length) {
    message.channel.send(`${message.author} hmmmm... :thinking:`)
  } else {
    message.channel.send(`${message.author} ${args.join(' ')} hmmmm... :thinking:`)
  }
}
