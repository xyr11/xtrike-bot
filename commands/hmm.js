exports.info = {
  name: 'hmm',
  category: 'Random',
  description: 'Reply with "hmm..."',
  usage: '`$$hmm [extra text]`',
  aliases: ['hmmm', 'hmmmm', 'hmmmmm'],
  permLevel: 'User',
  options: [{ type: 3, name: 'text', description: 'Extra text' }]
}

/** @param {import('../class/sendMsg')} msg */
exports.run = msg => msg.send(`${msg.author} ${msg.text ? msg.text + ' ' : ''}hmmmm... 🤔`)
