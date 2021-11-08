const { Client, Collection } = require('discord.js')
const fs = require('fs')
const chalk = require('chalk')

// access our .env file
const dotenv = require('dotenv')
dotenv.config()

// handle errors
const { sendErr } = require('./modules/errorCatch')
process.on('unhandledRejection', error => sendErr(error, client))

// get needed intents and partials
const { intents, partials } = require('./config')

// initialize client
const client = new Client({ intents, partials, ws: { properties: process.env.ISMOBILE === 'true' ? { $browser: 'Discord iOS' } : {} } })

// read the commands folder
client.commands = new Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
  const commandName = file.split('.')[0]
  // Add module of each of the command files
  const command = require(`./commands/${file}`)
  // Load em
  console.log(chalk.gray(`Loading the ${commandName} command`))
  client.commands.set(command.info.name, command)
}

// read the autoresponses folder
client.autoresponses = []
client.autoresponseNames = []
const autoresponseFiles = fs.readdirSync('./autoresponses').filter(file => file.endsWith('.js'))
for (const file of autoresponseFiles) {
  const autoresponseName = file.split('.')[0]
  // Add module of each of the autoresponse files
  const autoresponse = require(`./autoresponses/${file}`)
  // Load em
  console.log(chalk.gray(`Loading the ${autoresponseName} autoresponse`))
  // Add to arrays
  client.autoresponses.push(autoresponse)
  client.autoresponseNames.push(autoresponseName)
}

// read the events folder
const events = fs.readdirSync('./events').filter(file => file.endsWith('.js'))
for (const file of events) {
  const eventName = file.split('.')[0]
  // Add module of each of the event files
  const event = require(`./events/${file}`)
  // Load em
  console.log(chalk.gray(`Loading the ${eventName} event`))
  client.on(eventName, (...args) => event.execute(...args))
}

// express
const express = require('express')
const { urlencoded } = require('body-parser')
const app = express()
app.use(urlencoded({ extended: true }))

// Basic alive checker
app.get('/', (req, res) => {
  res.status(200).send('le alive')
})

// sniper
// const { msgDelete, msgEdit, reactRemove } = require('./modules/sniper')
// client.on('messageDelete', msgDelete)
// client.on('messageUpdate', msgEdit)
// client.on('messageReactionRemove', reactRemove)

client.login(process.env.DISCORD_TOKEN)
