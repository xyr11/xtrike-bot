const { Message } = require('discord.js') // eslint-disable-line no-unused-vars

exports.info = {
  name: 'message',
  category: 'Developer',
  description: 'Message as the bot',
  usage: '`$$message <text> [messageId]`',
  option: '`messageId` is the message you want to reply to (optional)',
  aliases: ['msg'],
  permLevel: 'lmao',
  requiredArgs: true
}

/**
 * @param {Message} message
 * @param {Array} args
 */
exports.run = async (message, interaction, args) => {
  if (!args[0]) return

  // the text to reply
  const text = args[0].replaceAll("''", ' ')
  // current channel
  const channel = message.channel

  if (args[1]) {
    // reply to channel id given on args[1]
    const messages = await channel.messages.fetch({ limit: 100 })
    const fetchedMsg = messages.get(args[1])
    if (fetchedMsg) await fetchedMsg.reply(text)
  } else {
    // normal message
    await channel.send(text)
  }
  message.delete().catch(err => {
    if (err.message === 'Missing Permissions') {
      return message.author.send(`I cannot delete your message because I have missing permissions in <#${message.channelId}>. You can delete your own message instead.`)
    }
    require('../modules/errorCatch')(err, message.client, message)
  })
}
