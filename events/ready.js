const { presence, time } = require('../config')
const chalk = require('chalk')
const mongoose = require('mongoose')

module.exports = async client => {
  console.log(chalk.green(`Ready as ${client.user.tag}! (${time()}) 🤖`))
  console.log(chalk.blue(`Stats: Currently in ${client.guilds.cache.size} servers with a combined amount of ${client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b)} members`))

  // presence
  if (presence.activity) {
    client.user.setPresence({
      activities: [{ name: presence.activity, type: presence.activityType ?? '' }],
      status: presence.status ?? 'online'
    })
  }

  // mongodb
  await mongoose.connect(process.env.MONGO_URI, { keepAlive: true })
}
