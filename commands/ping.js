const { colors, pingArea } = require('../config')

exports.info = {
  name: 'ping',
  category: 'Developer',
  description: 'ping',
  usage: 'ping',
  aliases: ['speed', 'latency'],
  permLevel: 'User'
}

exports.run = async (client, message, args) => {
  let botPing = []
  let clientPing = []
  const timeLogs = []

  await message.channel.send({
    embeds: [{ title: 'Pinging...' }]
  })

    .then(async sentMsg => {
      // send and edit a message 5 times, then get each of their createdTimestamp and Date.now() before being deleted
      message.channel.sendTyping()
      // number of loops
      let i = args[0] === 'debug' && Number(args[1]) && args[1] > 1 && args[1] < 30 ? args[1] : 5
      for (i; i--;) {
        await client.channels.cache.get(pingArea).send('​').then(async msg => {
          message.channel.sendTyping()
          await msg.edit('​​').then(async msg => {
            botPing.push(msg.editedTimestamp - msg.createdTimestamp)
            clientPing.push(Math.round(client.ws.ping))
            if (args[0] === 'debug') timeLogs.push(`<t:${Math.floor(msg.editedTimestamp / 1000)}:T> ping: ${msg.editedTimestamp - msg.createdTimestamp} | ${client.ws.ping}`)
            await msg.delete()
          })
        })
      }

      // compute average
      botPing = Math.floor((botPing.reduce((a, b) => a + b, 0) / botPing.length) || 0)
      clientPing = Math.floor((clientPing.reduce((a, b) => a + b, 0) / clientPing.length) || 0)

      message.channel.sendTyping()
      sentMsg.edit({
        embeds: [{
          color: colors.main,
          title: ':ping_pong: Ping!',
          description: `The bot's latency is: ${botPing}ms \nAPI latency is: ${clientPing}ms`,
          fields: timeLogs.length
            ? [{
                name: 'Logs',
                value: timeLogs.join('\n')
              }]
            : '',
          timestamp: Date.now()
        }]
      })
    })
}
