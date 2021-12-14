exports.info = {
  name: 'hmm',
  category: 'General',
  description: 'Reply with "hmm..."',
  usage: '`$$hmm [extra text]`',
  aliases: ['hmmm', 'hmmmm', 'hmmmmm'],
  permLevel: 'User',
  options: [
    {
      type: 3,
      name: 'text',
      description: 'Extra text'
    }
  ]
}

/**
 * @param {import('../modules/sendMsg')} msg
 * @param {Array=} args
 */
exports.run = (msg, args) => args.length
  ? msg.send(`${msg.author} ${args.join(' ')} hmmmm... :thinking:`)
  : msg.send(`${msg.author} hmmmm... :thinking:`)
