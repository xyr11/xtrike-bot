const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { discordToken, clientId } = require('../config')
const { registerSlashCommandsBody } = require('../modules/base')
const { storeInfo } = require('../modules/botInfo')
const { imgEntry, imgConfig } = require('../modules/getImage')

/** @param {import('discord.js').Guild} guild  */
exports.execute = async guild => {
  // Update server count
  storeInfo('serverCount', guild.client.guilds.cache.size)

  // Deploy slash commands
  const rest = new REST({ version: '9' }).setToken(discordToken)
  rest.put(Routes.applicationGuildCommands(clientId, guild.id), { body: registerSlashCommandsBody(guild.client) })

  // Check if ;image config entry doesn't exist yet
  // and then activate the ;image command
  if (!await imgEntry.get({ f: true, g: guild.id })) imgConfig.activate.server({ guildId: guild.id })
}
