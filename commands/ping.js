const { Message } = require('discord.js') // eslint-disable-line no-unused-vars
const { colors } = require('../config')
const chalk = require('chalk')

exports.info = {
  name: 'ping',
  category: 'Bot Info',
  description: "Get the bot's ping.",
  usage: '`$$ping`',
  aliases: ['speed', 'latency'],
  permLevel: 'User'
}

/**
 * @param {Message} message
 * @param {Array} args
 */
exports.run = async (message, args) => {
  const client = message.client

  let botPing = []
  let clientPing = []
  const logs = []

  await message.channel.send({
    embeds: [{ description: ':person_running: Pinging...' }]
  })

    .then(async sentMsg => {
      // number of loops. default is 4, max is 30
      const loops = (Number(args[0]) && args[0] > 0 && args[0] < 31) ? args[0] : 4

      // loop
      let referenceTime
      for (let i = loops; i--;) {
        // send a message
        // edit that message x times
        await sentMsg.edit({ content: '​​'.repeat(i + 1) }).then(async msg => {
          // get each of their createdTimestamp and Date.now()
          botPing.push(msg.editedTimestamp - (referenceTime || msg.createdTimestamp))
          clientPing.push(Math.round(client.ws.ping))
          if (loops !== 5) logs.push(`<t:${Math.floor(msg.editedTimestamp / 1000)}:T> ping: ${msg.editedTimestamp - (referenceTime || msg.createdTimestamp)} | ${client.ws.ping}`)
          // set reference time for next edit
          referenceTime = msg.editedTimestamp
        })
      }
      // compute average
      botPing = Math.floor((botPing.reduce((a, b) => a + b, 0) / botPing.length) || 0)
      clientPing = Math.floor((clientPing.reduce((a, b) => a + b, 0) / clientPing.length) || 0)
      // send the results
      await sentMsg.edit({
        embeds: [{
          title: ':ping_pong: Ping!',
          color: colors.main,
          description: `The bot's latency is: ${botPing}ms \nAPI latency is: ${clientPing}ms` +
            (logs.length
              ? `\n\n**Logs**\n${logs.join('\n')}`
              : ''),
          timestamp: Date.now()
        }]
      })
      console.log(chalk.blue(`Bot ping: ${botPing}ms | API ping: ${clientPing}ms | Count: ${loops} 🏓`))
    })
}
