exports.info = {
  name: 'hmm',
  category: 'Miscellaneous',
  description: 'Reply with "hmm..."',
  usage: 'hmm [Optional args]',
  aliases: ['hmmm', 'hmmmm', 'hmmmmm', 'hmmmmmm'],
  permLevel: 'User'
}

exports.run = (client, message, args) => {
  if (!args.length) {
    message.reply(`${message.author} hmmmmmm... :thinking:`)
  } else {
    message.channel.send(`${args} hmmmmmm... :thinking:`)
  }
}
