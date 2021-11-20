const { Message, Interaction, MessageEmbed } = require('discord.js') // eslint-disable-line no-unused-vars

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

  // reply
  thing.reply(`Test received! ${args.length ? '\nargs: ' + args.join(',') : ''}`)

  /** @type {MessageEmbed} */
  let debugEmbed
  // debug
  if (args[0] === 'embed') {
    // should produce a ReferenceError error
    thing.reply(testing_the_error_embed_dont_mind) // eslint-disable-line no-undef
  } else if (args[0] === 'debug') {
    // Message / Interaction
    const { ...serialized } = thing
    debugEmbed = { description: '```' + JSON.stringify(serialized, (key, val) => typeof val === 'bigint' ? val.toString() : val, 2) + '```' }
  } else if (args[0] === 'author') {
    // author User
    debugEmbed = { description: '```' + JSON.stringify(thing.author, undefined, 2) + '```' }
  } else if (args[0] === 'bot') {
    // client bot User
    debugEmbed = { description: '```' + JSON.stringify(thing.client.user, undefined, 2) + '```' }
  } else if (args[0] === 'commands') {
    // output all commands
    console.log(thing.client.commands)
  } else if (args[0] === 'help') {
    // return the help info of each command
    if (message) for (const cmd of thing.client.commands.map(a => a.info.name)) thing.client.commands.get('help').run(message, null, [cmd])
  }
  if (debugEmbed) {
    if (interaction) interaction.followUp({ embeds: [debugEmbed] })
    else message.reply({ embeds: [debugEmbed] })
  }
}
