const { Message } = require('discord.js') // eslint-disable-line no-unused-vars

exports.info = {
  name: 'hmm',
  category: 'General',
  description: 'Reply with "hmm..."',
  usage: '`hmm [args]`',
  aliases: ['hmmm', 'hmmmm', 'hmmmmm', 'hmmmmmm'],
  permLevel: 'User'
}

/**
 * @param {Message} message
 * @param {Array} args
 */
exports.run = (message, args) => {
  if (!args.length) {
    message.channel.send(`${message.author} hmmmm... :thinking:`)
  } else {
    message.channel.send(`${message.author} ${args.join(' ')} hmmmm... :thinking:`)
  }
}
