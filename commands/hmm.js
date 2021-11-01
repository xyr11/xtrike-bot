exports.info = {
  name: 'hmm',
  category: 'General',
  description: 'Reply with "hmm..."',
  usage: '`hmm [args]`',
  aliases: ['hmmm', 'hmmmm', 'hmmmmm', 'hmmmmmm'],
  permLevel: 'User'
}

exports.run = (client, message, args) => {
  if (!args.length) {
    message.reply(`${message.author} hmmmmmm... :thinking:`)
  } else {
    message.reply(`${args.join(' ')} hmmmmmm... :thinking:`)
  }
}
