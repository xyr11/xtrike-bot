const { Client, Collection } = require('discord.js')
const fs = require('fs')
const chalk = require('chalk')
const dotenv = require('dotenv')
dotenv.config()

// read config.json
const { intents, partials, presence, time } = require('./config')

// handle errors
const errorCatch = require('./modules/errorCatch')
process.on('unhandledRejection', error => errorCatch(error, client))

// initialize client
const client = new Client({ intents, partials })

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

// log if ready
client.on('ready', async () => {
  console.log(chalk.green(`Ready as ${client.user.tag}! (${time()}) 🤖`))

  // presence
  if (presence.activity) {
    client.user.setPresence({
      activities: [{ name: presence.activity, type: presence.activityType ?? '' }],
      status: presence.status ?? 'online'
    })
  }
})

client.login(process.env.DISCORD_TOKEN)
