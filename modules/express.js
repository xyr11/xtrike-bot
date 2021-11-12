const { Client } = require('discord.js') // eslint-disable-line no-unused-vars
const chalk = require('chalk')
const express = require('express')
const cors = require('cors')

/** @param {Client} client */
module.exports = client => {
  const app = express()

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(cors())

  // api to check the bot status
  app.all('/', (req, res) => {
    res.status(200).send('le alive')
  })

  // get bot statistics
  app.all('/some/statistics', (req, res) => {
    res.status(200).json({
      status: 404,
      message: 'Never gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you',
      timeSent: Date.now(),
      serverCount: client.guilds.cache.size
    })
  })

  app.listen(3000, () => {
    console.log(chalk.green('Server is up 🚀'))
  })
}
