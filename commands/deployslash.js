const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const BotCmd = require('../class/botCmd')

module.exports = new BotCmd('deployslash')
  .setCategory('Developer')
  .setDescription('Deploy slash commands.')
  .setUsage('`$$deployslash [options]`')
  .setOptionText('`--all` to deploy on all servers (may take up to an hour)')
  .requiredPerm('lmao')
  .callback(async (msg, args) => {
    const { discordToken, clientId } = require('../config')
    const { registerSlashCommandsBody } = require('../modules/base')

    await msg.reply('Deploying slash commands...')

    // Get route
    const rest = new REST({ version: '9' }).setToken(discordToken)
    let route
    if (args[0] === '--all') route = Routes.applicationCommands(clientId) // Deploy in all guilds
    else route = Routes.applicationGuildCommands(clientId, msg.guildId) // Deploy in current server

    // Deploy
    rest.put(route, { body: registerSlashCommandsBody(msg.client) }).then(() => {
      msg.send('Successfully deployed application commands!')
      msg.info('Registered application commands', args[0] === '--all' ? 'in all guilds' : '')
    })
  })
