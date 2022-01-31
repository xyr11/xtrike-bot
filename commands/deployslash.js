const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { discordToken, clientId } = require('../config')
const { registerSlashCommandsBody } = require('../modules/base')

exports.info = {
  name: 'deployslash',
  category: 'Developer',
  description: 'Deploy slash commands.',
  usage: '`$$deployslash`',
  option: '`--all` to deploy on all servers (may take up to an hour)',
  permLevel: 'lmao',
  options: []
}

/**
 * @param {import('../class/sendMsg')} msg
 * @param {Array} args
 */
exports.run = async (msg, args) => {
  await msg.reply('Deploying slash commands...')

  // Deploy
  const rest = new REST({ version: '9' }).setToken(discordToken)
  const route = args[0] === '--all'
    ? Routes.applicationCommands(clientId) // deploy in all guilds
    : Routes.applicationGuildCommands(clientId, msg.guildId) // deploy in current server
  rest.put(route, { body: registerSlashCommandsBody(msg.client) }).then(() => {
    msg.send('Successfully deployed application commands!')
    msg.info('Registered application commands', args[0] === '--all' ? 'in all guilds' : '')
  })
}
