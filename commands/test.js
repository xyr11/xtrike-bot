const { Message, Interaction } = require('discord.js') // eslint-disable-line no-unused-vars

exports.info = {
  name: 'test',
  category: 'Developer',
  description: 'Test',
  usage: '`$$test`',
  aliases: ['tests'],
  permLevel: 'User'
}

/**
 * @param {Message} message
 * @param {Interaction} interaction
 * @param {Array} args
 */
exports.run = async (message, interaction, args) => {
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
  } else if (args[0] === 'author') {
    message.channel.send({
      embeds: [{
        description: '```' + JSON.stringify(message.author, undefined, 2) + '```'
      }]
    })
  } else if (args[0] === 'bot') {
    message.channel.send({
      embeds: [{
        description: '```' + JSON.stringify(message.client.user, undefined, 2) + '```'
      }]
    })
  }
}
