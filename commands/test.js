exports.info = {
  name: 'test',
  category: 'Developer',
  description: 'test',
  usage: 'test [Optional args]',
  aliases: ['tests'],
  permLevel: 'Server Owner'
}

exports.run = (client, message, args) => {
  message.channel.send(`Test received! ${args.length ? '\nargs: ' + args.join(',') : ''}`)
  if (args[0] === 'embed') {
    // should produce a ReferenceError error
    message.channel.send(testing_the_error_embed_dont_mind) // eslint-disable-line no-undef
  } else if (args[0] === 'debug') {
    message.channel.send({
      embeds: [{
        description: '```' + JSON.stringify(message, undefined, 2) + '```'
      }]
    })
  }
}
