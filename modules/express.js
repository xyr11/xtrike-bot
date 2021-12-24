const express = require('express')
const cors = require('cors')
const { getInfo, getKeys, getAll } = require('../modules/botInfo')
const { logGood } = require('./logger')

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

// Api to check the bot status
app.all('/', (req, res) => {
  res.status(200).send('le alive')
})

// Get bot statistics
app.all('/stats', async (req, res) => {
  const stats = {};
  (await getAll()).forEach(e => { stats[e._id] = e.d })
  res.send({
    ...stats,
    timeSent: Date.now(),
    message: 'Never gonna give you up'
  })
})

app.all('/stats/keys', async (req, res) => {
  res.send(await getKeys())
})

app.all('/stats/:id', async (req, res) => {
  const result = await getInfo(req.params.id + 'Stat') || await getInfo(req.params.id)
  if (result) res.send(result + '')
  else res.status(404).send()
})

module.exports = () => app.listen(3000, () => logGood('Server is up 🚀'))
