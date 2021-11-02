const { Client, Collection } = require('discord.js')
const fs = require('fs')
const chalk = require('chalk')

// access our .env file
const dotenv = require('dotenv')
dotenv.config()

// handle errors
const errorCatch = require('./modules/errorCatch')
process.on('unhandledRejection', error => errorCatch(error, client, require('./modules/currentMsg').get()))

// get needed intents and partials
const { intents, partials } = require('./config')

// initialize client
const client = new Client({ intents, partials, ws: { properties: process.env.ISMOBILE === 'true' ? { $browser: 'Discord iOS' } : {} } })

// read the commands folder
client.commands = new Collection()
const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of files) {
  const commandName = file.split('.')[0]
  // Add module of each of the command files
  const command = require(`./commands/${file}`)
  // Load em
  console.log(chalk.gray(`Loading the ${commandName} command`))
  client.commands.set(command.info.name, command)
}

// read the events folder
const events = fs.readdirSync('./events').filter(file => file.endsWith('.js'))
for (const file of events) {
  const eventName = file.split('.')[0]
  // Add module of each of the event files
  const event = require(`./events/${file}`)
  // Load em
  console.log(chalk.gray(`Loading the ${eventName} event`))
  client.on(eventName, event.bind(null, client))
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

client.login(process.env.DISCORD_TOKEN)
