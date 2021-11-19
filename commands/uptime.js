const { Message, Interaction } = require('discord.js') // eslint-disable-line no-unused-vars
const { colors } = require('../config')
const { getInfo } = require('../modules/botInfo')

exports.info = {
  name: 'uptime',
  category: 'Bot Info',
  description: 'Get the uptime of the bot.',
  usage: '`$$uptime`',
  aliases: ['runtime'],
  permLevel: 'User'
}

/**
 * @param {Message} message
 * @param {Interaction} interaction
 */
exports.run = async (message, interaction) => {
  const thing = message || interaction

  // get time when bot started
  const upSince = await getInfo('upSince')
  if (!upSince) return thing.reply('Sorry, I forgot how long my uptime is. Please try again later.')

  // get uptime
  const uptime = Date.now() - upSince

  // get seconds, minutes, hours, days, years
  const s = Math.floor(uptime % (1000 * 60) / 100) / 10
  const m = Math.floor(uptime % (1000 * 60 * 60) / (1000 * 60))
  const h = Math.floor(uptime % (1000 * 60 * 60 * 24) / (1000 * 60 * 60))
  const d = Math.floor(uptime % (1000 * 60 * 60 * 24 * 365) / (1000 * 60 * 60 * 24))
  const y = Math.floor(uptime / (1000 * 60 * 60 * 24 * 365))

  thing.reply({
    embeds: [{
      color: colors.green,
      title: '🟢 Bot Uptime',
      description: 'Uptime since last reboot: ' +
        (y ? `${y}y ` : '') +
        (d ? `${d}d ` : '') +
        (h ? `${h}h ` : '') +
        (m ? `${m}m ` : '') +
        (s ? `${s}s ` : ''),
      footer: { text: 'Last reboot:' },
      timestamp: upSince
    }]
  })
}
