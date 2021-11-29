const { Message, Interaction } = require('discord.js') // eslint-disable-line no-unused-vars
const { colors } = require('../modules/base')

exports.info = {
  name: 'ping',
  category: 'Bot Info',
  description: "Get the bot's ping.",
  usage: '`$$ping`',
  aliases: ['speed', 'latency'],
  permLevel: 'User',
  options: [
    {
      type: 4,
      name: 'repeat',
      description: 'How many times will the bot ping'
    }
  ]
}

/**
 * @param {Message} message
 * @param {Interaction} interaction
 * @param {Array} args
 */
exports.run = async (message, interaction, args) => {
  const thing = message ?? interaction
  const client = thing.client

  // send initial message
  let sentMsg = await thing.reply({ embeds: [{ description: ':person_running: Pinging...' }] })
  if (interaction) sentMsg = interaction

  let botPing = []
  let clientPing = []
  const logs = []

  // loop
  const loops = (Number(args[0]) && args[0] > 0 && args[0] < 31) ? args[0] : 4
  let referenceTime
  for (let i = loops; i--;) {
    // edit the message
    await (message
      ? sentMsg.edit({ content: '​'.repeat(i + 1) })
      : sentMsg.editReply({ content: '​'.repeat(i + 1) })).then(async msg => {
      // get the time difference between the message edits
      botPing.push(Math.floor((msg.editedTimestamp - (referenceTime || msg.createdTimestamp)) / 10) * 10)
      clientPing.push(Math.round(client.ws.ping))
      if (loops !== 4) logs.push(`<t:${Math.floor(msg.editedTimestamp / 1000)}:T> ping: ${msg.editedTimestamp - (referenceTime || msg.createdTimestamp)} | ${client.ws.ping}`)
      // set reference time for next edit
      referenceTime = msg.editedTimestamp
    })
  }

  // compute average
  botPing = Math.floor((botPing.reduce((a, b) => a + b, 0) / botPing.length) || 0)
  clientPing = Math.floor((clientPing.reduce((a, b) => a + b, 0) / clientPing.length) || 0)

  // send the results
  const results = {
    embeds: [{
      title: ':ping_pong: Ping!',
      color: colors.main,
      description: `The bot's latency is: ${botPing}ms \nAPI latency is: ${clientPing}ms` +
        (logs.length
          ? `\n\n**Logs**\n${logs.join('\n')}`
          : ''),
      timestamp: Date.now()
    }]
  }
  await message ? sentMsg.edit(results) : sentMsg.editReply(results)
}
