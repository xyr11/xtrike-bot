const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { discordToken, clientId, testingServer } = require('../config')
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
  // Check if there is a test server given
  if (!testingServer) throw new Error('No test server id was found in your config.js')

  await msg.reply('Deploying slash commands...')

  // Deploy
  const rest = new REST({ version: '9' }).setToken(discordToken)
  rest.put(
    args[0] === '--all'
      ? Routes.applicationCommands(clientId) // deploy in all guilds
      : Routes.applicationGuildCommands(clientId, testingServer), // deploy in bot server
    { body: registerSlashCommandsBody(msg.client) }
  ).then(() => {
    msg.send('Successfully deployed application commands!')
    msg.info('Registered application commands', args[0] === '--all' ? 'in all guilds' : '')
  })
}
