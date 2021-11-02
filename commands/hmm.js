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
    message.channel.send(`${message.author} hmmmm... :thinking:`)
  } else {
    message.channel.send(`${message.author} ${args.join(' ')} hmmmm... :thinking:`)
  }
}
