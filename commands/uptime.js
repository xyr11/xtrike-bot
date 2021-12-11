const { MessageEmbed } = require('discord.js')
const { colors } = require('../modules/base')
const { getInfo } = require('../modules/botInfo')

exports.info = {
  name: 'uptime',
  category: 'Bot Info',
  description: 'Get the uptime of the bot.',
  usage: '`$$uptime`',
  aliases: ['runtime'],
  permLevel: 'User'
}

/** @param {import('../modules/sendMsg')} msg */
exports.run = async msg => {
  // get time when bot started
  const upSince = await getInfo('upSince')
  if (!upSince) return msg.reply('Sorry, I think I forgot how long I was up today. Please try again later.')

  // get uptime
  const uptime = Date.now() - upSince

  // get seconds, minutes, hours, days, years
  const s = Math.floor(uptime % (1000 * 60) / 100) / 10
  const m = Math.floor(uptime % (1000 * 60 * 60) / (1000 * 60))
  const h = Math.floor(uptime % (1000 * 60 * 60 * 24) / (1000 * 60 * 60))
  const d = Math.floor(uptime % (1000 * 60 * 60 * 24 * 365) / (1000 * 60 * 60 * 24))
  const y = Math.floor(uptime / (1000 * 60 * 60 * 24 * 365))

  msg.reply({
    embeds: [new MessageEmbed()
      .setColor(colors.green)
      .setTitle('🟢 Bot Uptime')
      .setDescription('Uptime since last reboot: ' +
        (y ? `${y}y ` : '') +
        (d ? `${d}d ` : '') +
        (h ? `${h}h ` : '') +
        (m ? `${m}m ` : '') +
        (s ? `${s}s ` : ''))
      .setFooter('Last reboot:')
      .setTimestamp(upSince)]
  })
}
