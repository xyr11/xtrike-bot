const { Message } = require('discord.js') // eslint-disable-line no-unused-vars
const chalk = require('chalk')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { time, PermLevels } = require('../config')

exports.info = {
  name: 'deployslash',
  category: 'Developer',
  description: 'Deploy slash commands.',
  usage: '`$$deployslash`',
  aliases: [],
  permLevel: 'lmao'
}

/**
 * @param {Message} message
 */
exports.run = async message => {
  const { DISCORD_TOKEN, CLIENT_ID, DEPLOY_SLASH, BOT_SERVER } = process.env
  // check if there is a test server given
  if (DEPLOY_SLASH !== 'true' && BOT_SERVER === '') throw new Error('No test server id was found in your .env')

  await message.reply('Deploying slash commands...')

  // get each command
  const body = Array.from(message.client.commands, ([name, value]) => value.info)
    .filter(a => PermLevels[a.permLevel].level < 4) // filter commands available to bot admins and below
    .map(({ name, description, options }) => ({ name, description, options })) // get the name, description, and options properties
  // clean description field
  body.forEach(a => {
    a.description = a.description.replace(/{{((?!}}).)+}}/g, ' ') // remove all stuff enclosed by `{{` and `}}`
      .replace(/(\s|\n)+/g, ' ') // remove newlines and double spaces
      .replace(/^ *| *$/g, '') // remove extra spaces before and after the string
  })

  // deploy
  const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN)
  rest.put(
    DEPLOY_SLASH === 'true'
      ? Routes.applicationCommands(CLIENT_ID) // deploy in all guilds
      : Routes.applicationGuildCommands(CLIENT_ID, BOT_SERVER), // deploy in bot server
    { body }
  ).then(() => {
    console.log(chalk.blue('Successfully registered application commands.'), chalk.bgBlueBright.black(`(${time()})`))
    message.channel.send('Successfully registered application commands.')
  })
}
