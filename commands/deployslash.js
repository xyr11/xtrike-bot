const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { discordToken, clientId, deploySlash, testingServer } = require('../config')
const { PermLevels } = require('../modules/base')

exports.info = {
  name: 'deployslash',
  category: 'Developer',
  description: 'Deploy slash commands.',
  usage: '`$$deployslash`',
  aliases: [],
  permLevel: 'lmao'
}

/** @param {import('../modules/sendMsg')} msg */
exports.run = async msg => {
  // Check if there is a test server given
  if (!deploySlash && !testingServer) throw new Error('No test server id was found in your config.js')

  await msg.reply('Deploying slash commands...')

  // Get each command
  const body = Array.from(msg.client.commands, ([name, value]) => value.info)
    .filter(a => PermLevels[a.permLevel].level < 4) // filter commands available to bot admins and below
    .map(({ name, description, options }) => ({ name, description, options })) // get the name, description, and options properties
  // Clean description field
  body.forEach(a => {
    a.description = a.description.replace(/{{((?!}}).)+}}/g, ' ') // remove all stuff enclosed by `{{` and `}}`
      .replace(/(\s|\n)+/g, ' ') // remove newlines and double spaces
      .replace(/^ *| *$/g, '') // remove extra spaces before and after the string
  })

  // Deploy
  const rest = new REST({ version: '9' }).setToken(discordToken)
  rest.put(
    deploySlash
      ? Routes.applicationCommands(clientId) // deploy in all guilds
      : Routes.applicationGuildCommands(clientId, testingServer), // deploy in bot server
    { body }
  ).then(() => {
    msg.send('Successfully registered application commands')
    msg.info('Successfully registered application commands')
  })
}
