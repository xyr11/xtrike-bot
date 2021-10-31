exports.info = {
  name: 'hmm',
  category: 'General',
  description: 'Reply with "hmm..."',
  usage: 'hmm [Optional args]',
  aliases: ['hmmm', 'hmmmm', 'hmmmmm', 'hmmmmm'],
  permLevel: 'User'
}

exports.run = (client, message, args) => {
  if (!args.length) {
    message.reply(`${message.author} hmmmmm... :thinking:`)
  } else {
    message.reply(`${args.join(' ')} hmmmmm... :thinking:`)
  }
}
