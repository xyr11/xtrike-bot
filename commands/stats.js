const { MessageEmbed } = require('discord.js')
const { PermLevels, colors } = require('../modules/base')
const { getAll } = require('../modules/botInfo')

exports.info = {
  name: 'stats',
  category: 'Bot Info',
  description: 'Get some statistics regarding the bot',
  usage: '`$$stats`',
  aliases: ['statistics'],
  permLevel: 'User'
}

/** @param {import('../modules/sendMsg')} msg */
exports.run = async msg => {
  // filter command names available to bot admins and below
  /** @type {Map} */
  const cmdsMap = msg.client.commands.filter(a => PermLevels[a.info.permLevel].level < 4).keys()
  const [...cmds] = cmdsMap // convert to array

  // get all data at once
  const stat = await getAll()

  // get statistics of all commands from cmds
  const cmdsStats = stat.map(e => cmds.includes(e._id.slice(0, -4)) && e.d ? e._id.slice(0, -4) + ': ' + e.d : '')
    .filter(e => e) // filter empty strings

  // reply
  await msg.reply({
    embeds: [new MessageEmbed()
      .setTitle('Xtrike Bot Command Statistics')
      .setDescription(cmdsStats.join('\n') || 'No available data yet')
      .setColor(colors.main)
      .setFooter('Statistics for the whole bot')
      .setTimestamp()]
  })
}
