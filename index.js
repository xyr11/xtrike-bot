const { Client, Collection } = require('discord.js')
const fs = require('fs')
const chalk = require('chalk')
const config = require('./config')
const { intents, partials } = require('./modules/base')

// access our .env file
const dotenv = require('dotenv')
dotenv.config()

// initialize client
const client = new Client({ intents, partials, ws: { properties: config.isMobile ? { $browser: 'Discord iOS' } : {} } })

// handle errors
const outputErr = require('./modules/errorCatch')
process.on('unhandledRejection', error => outputErr(error, client))
client.on('error', error => outputErr(error, client))

// read the commands folder
client.commands = new Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
console.log(chalk.gray('Loading commands'))
for (const file of commandFiles) {
  // Add module of each of the command files
  const command = require(`./commands/${file}`)
  // Load em
  client.commands.set(command.info.name, command)
}

// read the autoresponses folder
client.autoresponses = []
client.autoresponseNames = []
const autoresponseFiles = fs.readdirSync('./autoresponses').filter(file => file.endsWith('.js'))
console.log(chalk.gray('Loading autoresponses'))
for (const file of autoresponseFiles) {
  const name = file.split('.')[0]
  // Add module of each of the autoresponse files
  const autoresponse = require(`./autoresponses/${file}`)
  // Add to arrays
  client.autoresponses.push(autoresponse)
  client.autoresponseNames.push(name)
}

// read the events folder
const events = fs.readdirSync('./events').filter(file => file.endsWith('.js'))
console.log(chalk.gray('Loading events'))
for (const file of events) {
  const eventName = file.split('.')[0]
  // Add module of each of the event files
  const event = require(`./events/${file}`)
  // Load em
  client.on(eventName, (...args) => event.execute(...args))
}

client.login(config.discordToken)
