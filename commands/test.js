const { Message, Interaction, MessageEmbed } = require('discord.js') // eslint-disable-line no-unused-vars

exports.info = {
  name: 'test',
  category: 'Developer',
  description: 'Test',
  usage: '`$$test`',
  aliases: ['tests'],
  permLevel: 'User',
  options: [
    { type: 3, name: 'string', description: 'Test' },
    { type: 4, name: 'integer', description: 'test' },
    { type: 5, name: '--flag', description: 'test' },
    { type: 6, name: 'user', description: 'test' },
    { type: 7, name: 'channel', description: 'test' },
    { type: 8, name: 'role', description: 'test' },
    { type: 9, name: 'mentionable', description: 'test' },
    { type: 10, name: 'number', description: 'test' }
  ]
}

/**
 * @param {Message} message
 * @param {Interaction} interaction
 * @param {Array} args
 */
exports.run = async (message, interaction, args) => {
  const thing = message || interaction
  const client = thing.client

  // reply
  await thing.reply(`Test received! ${args.length ? '\nargs: ' + args.join(',') : ''}`)

  /** @type {MessageEmbed} */
  let debugEmbed
  // debug
  if (args[0] === 'embed') {
    // should produce a ReferenceError error
    thing.reply(testing_the_error_embed_dont_mind) // eslint-disable-line no-undef
  } else if (args[0] === 'debug') {
    // message/interaction object
    const { ...serialized } = thing
    debugEmbed = { description: '```' + JSON.stringify(serialized, (key, val) => typeof val === 'bigint' ? val.toString() : val, 2) + '```' }
  } else if (args[0] === 'author') {
    // author user
    debugEmbed = { description: '```' + JSON.stringify(thing.author, undefined, 2) + '```' }
  } else if (args[0] === 'bot') {
    // client bot user
    debugEmbed = { description: '```' + JSON.stringify(client.user, undefined, 2) + '```' }
  } else if (args[0] === 'commands') {
    // output all commands
    console.log(client.commands)
  } else if (args[0] === 'help') {
    // return the help info of each command
    if (message) {
      for (const cmd of client.commands.map(a => a.info.name)) client.commands.get('help').run(message, null, [cmd])
    }
  } else if (args[0] === 'options') {
    // show interaction options
    if (interaction) debugEmbed = { description: '```' + JSON.stringify(interaction.options.data, undefined, 2) + '```' }
  }

  // send debug messages
  if (!debugEmbed) return
  if (interaction) interaction.followUp({ embeds: [debugEmbed] })
  else message.send({ embeds: [debugEmbed] })
}
