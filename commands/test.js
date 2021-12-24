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
 * @param {import('../modules/sendMsg')} msg
 * @param {Array} args
 */
exports.run = async (msg, args) => {
  const { client } = msg

  // Reply
  await msg.reply(`Test received! ${args.length ? '\nargs: ' + args.join(',') : ''}`)

  /** @param {Object|Array} obj */
  const json = obj => JSON.stringify(obj, (key, val) => typeof val === 'bigint' ? val.toString() : val, 2)

  /** @type {import('discord.js').MessageEmbed} */
  let debugEmbed
  // Debug options
  if (args[0] === 'embed') {
    // should produce a ReferenceError error
    msg.reply(testing_the_error_embed_dont_mind) // eslint-disable-line no-undef
  } else if (args[0] === 'debug') {
    // Message/Interaction object
    debugEmbed = { description: '```json\n' + json({ ...msg }) + '```' }
  } else if (args[0] === 'author') {
    // author User
    debugEmbed = { description: '```json\n' + json(msg.author) + '\n```' }
  } else if (args[0] === 'member') {
    // author guildMember
    debugEmbed = { description: '```json\n' + json(msg.guild.members.cache.get(msg.author.id)) + '\n```' }
  } else if (args[0] === 'reference') {
    // Message Reference
    if (msg.isMsg && msg.reference) debugEmbed = { description: '```json\n' + json(msg.channel.messages.cache.get(msg.reference.messageId)) + '\n```' }
  } else if (args[0] === 'bot') {
    // clientUser
    debugEmbed = { description: '```json\n' + json(client.user) + '\n```' }
  } else if (args[0] === 'commands') {
    // Output all commands
    msg.log(client.commands)
  } else if (args[0] === 'help') {
    // Return the help info of each command
    if (msg.isMsg) for (const cmd of client.commands.map(a => a.info.name)) client.commands.get('help').run(msg, null, [cmd])
  } else if (args[0] === 'options') {
    // Show interaction options
    if (msg.isSlash) debugEmbed = { description: '```json\n' + json(msg.options.data) + '\n```' }
  }

  // Send debug embed
  if (!debugEmbed) return
  msg.send({ embeds: [debugEmbed] })
}
