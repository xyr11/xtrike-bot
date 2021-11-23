const { Message } = require('discord.js') // eslint-disable-line no-unused-vars
const chalk = require('chalk')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { time, permLevels } = require('../config')

exports.info = {
  name: 'deployslash',
  category: 'Developer',
  description: 'Deploy slash commands. \nFor developers only.',
  usage: '`$$deployslash`',
  aliases: [],
  permLevel: 'lmao'
}

/**
 * @param {Message} message
 */
exports.run = async message => {
  const { DISCORD_TOKEN, CLIENT_ID, DEPLOY_SLASH, BOT_SERVER } = process.env
  if (DEPLOY_SLASH !== 'true' && BOT_SERVER === '') throw new Error('No test server id was found in your .env')

  await message.reply('Deploying slash commands...')

  const commands = message.client.commands
  // get info property
  let slashCommands = Array.from(commands, ([name, value]) => value.info)
  slashCommands = slashCommands
    .filter(a => permLevels.find(l => l.name === a.permLevel).level <= 3) // filter commands available to permLevel 3 and below
    .map(({ name, description, options }) => ({ name, description, options })) // get the name, description, and options properties
  slashCommands.forEach(a => {
    a.description = a.description.replace(/\s*{{[^}]+}}/g, ' ') // remove all stuff between `{{` and `}}`
      .replace(/(\n){1,}/g, ' ') // remove newlines
      .replace(/ {2,}/g, ' ') // remove double spaces
  })

  // deploy
  const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN)
  rest.put(
    DEPLOY_SLASH === 'true'
      ? Routes.applicationCommands(CLIENT_ID)
      : Routes.applicationGuildCommands(CLIENT_ID, BOT_SERVER),
    { body: slashCommands }
  )
    .then(() => {
      console.log(chalk.blue('Successfully registered application commands.'), chalk.bgBlueBright.black(`(${time()})`))
      message.channel.send('Successfully registered application commands.')
    })
    .catch(console.error)
}
