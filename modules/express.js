const { Client } = require('discord.js') // eslint-disable-line no-unused-vars
const chalk = require('chalk')
const express = require('express')
const cors = require('cors')
const { getInfo, keys, all } = require('../modules/botInfo')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.put('*', (req, res) => {
  res.status(404)
})

app.delete('*', (req, res) => {
  res.status(404)
})

// api to check the bot status
app.all('/', (req, res) => {
  res.status(200).send('le alive')
})

// get bot statistics
app.all('/stats', async (req, res) => {
  const stats = {};
  (await all()).forEach(e => { stats[e._id] = e.d })
  res.send({
    ...stats,
    timeSent: Date.now(),
    message: 'Never gonna give you up'
  })
})

app.all('/stats/keys', async (req, res) => {
  res.send(await keys())
})

app.all('/stats/:id', async (req, res) => {
  const result = await getInfo(req.params.id + 'Stat') || await getInfo(req.params.id)
  if (result) res.send(result + '')
  else res.status(404).send()
})

module.exports = () => app.listen(3000, () => {
  console.log(chalk.green('Server is up 🚀'))
})
