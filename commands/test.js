const { Message, Interaction } = require('discord.js') // eslint-disable-line no-unused-vars

exports.info = {
  name: 'test',
  category: 'Developer',
  description: 'Test',
  usage: '`$$test`',
  aliases: ['tests'],
  permLevel: 'User',
  options: [
    {
      type: 3,
      name: 'test',
      description: 'Test'
    }
  ]
}

/**
 * @param {Message} message
 * @param {Interaction} interaction
 * @param {Array} args
 */
exports.run = (message, interaction, args) => {
  const thing = message || interaction
  if (interaction) console.log(interaction)

  thing.reply(`Test received! ${args.length ? '\nargs: ' + args.join(',') : ''}`)
  if (args[0] === 'embed') {
    // should produce a ReferenceError error
    thing.reply(testing_the_error_embed_dont_mind) // eslint-disable-line no-undef
  } else if (args[0] === 'debug') {
    thing.reply({ embeds: [{ description: '```' + JSON.stringify(thing, undefined, 2) + '```' }] })
  } else if (args[0] === 'author') {
    thing.reply({ embeds: [{ description: '```' + JSON.stringify(thing.author, undefined, 2) + '```' }] })
  } else if (args[0] === 'bot') {
    thing.reply({ embeds: [{ description: '```' + JSON.stringify(thing.client.user, undefined, 2) + '```' }] })
  } else if (args[0] === 'commands') {
    console.log(thing.client.commands)
  } else if (args[0] === 'help') {
    for (const cmd of thing.client.commands.map(a => a.info.name)) thing.client.commands.get('help').run(thing, false, [cmd])
  }
}
