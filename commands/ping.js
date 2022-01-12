const { MessageEmbed } = require('discord.js')
const { botColor } = require('../modules/base')

exports.info = {
  name: 'ping',
  category: 'Bot',
  description: "Get the bot's current ping",
  usage: '`$$ping`',
  aliases: ['speed', 'latency'],
  permLevel: 'User',
  options: [{ type: 4, name: 'repeat', description: 'How many times will the bot ping' }]
}

/**
 * @param {import('../class/sendMsg')} msg
 * @param {Array} args
 */
exports.run = async (msg, args) => {
  const { client } = msg
  const botPing = []
  const clientPing = []
  const logs = []

  // Send initial message
  await msg.setDefer()
  await msg.reply({ embeds: [{ description: 'Loading...' }] })

  // Number of loops
  const loops = (Number(args[0]) && args[0] > 0 && args[0] < 31) ? args[0] : 3
  let referenceTime
  // Loop for repetitions
  for (let i = loops; i--;) {
    // Edit the message
    await msg.edit({ embeds: [{ description: '🏃‍♂️ Pinging..... ' + '/-\\|'.split('')[i % 4] }] }).then(async editedMsg => {
      // Get the time difference between the message edits
      botPing.push(Math.floor((editedMsg.editedTimestamp - (referenceTime || editedMsg.createdTimestamp)) / 10) * 10)
      clientPing.push(Math.round(client.ws.ping))
      // If debug mode is turned on
      if (loops !== 3) logs.push(`<t:${Math.floor(editedMsg.editedTimestamp / 1000)}:T> ping: ${editedMsg.editedTimestamp - (referenceTime || editedMsg.createdTimestamp)} | ${client.ws.ping}`)
      // Set reference time for next edit
      referenceTime = editedMsg.editedTimestamp
    })
  }

  // Compute average
  /** @param {Number[]} arr */
  const average = arr => Math.floor(arr.reduce((a, b) => a + b, 0) / arr.length) || 0

  // Send the results
  await msg.edit({
    embeds: [new MessageEmbed()
      .setTitle('🏓 Ping!')
      .setColor(botColor)
      .setDescription(`The bot's latency is: ${average(botPing)}ms \n API latency is: ${average(clientPing)}ms` + (logs.length ? `\n\n **Logs** \n ${logs.join('\n')}` : ''))
      .setTimestamp(Date.now())]
  })
}
