const { MessageEmbed } = require('discord.js')

exports.info = {
  name: 'message',
  category: 'General',
  description: 'Message as the bot',
  usage: '`$$message [messageId] [<content> and/or <embed>]`',
  option: '`[messageId]`: the id of the message to reply on (optional)\n' +
    '`<content>`: content of the message\n' +
    '`<embed>`: embed of the message. To create one, add the following prefixes that correspond to parts of an embed (the author, body, OR title is required): \n' +
    '— `$a`: Author, `$r`: Author link (it will turn the author part to a link), `$n`: Author icon (url of the icon) \n' +
    '— `$t`: Title, `$u`: Title link \n' +
    '— `$d`: Body or description (Discord formatting works here!) \n' +
    '— `$c`: Color (Common names like "blue" or hex values like "#77E4FF") \n' +
    '— `$i`: Image (url), `$h`: Thumbnail (a small image at the corner) (url) \n' +
    '— `$f`: Footer, `$o`: Footer icon (url) \n' +
    '— `$s`: Timestamp ("2020-03-11", "11:11:11 AM March 11, 2020", "1583925071000", or just the prefix only) \n\n' +
    '**Example:** `;msg check below! $d **body!!** $c #E4676E $t Rly 😎 embd titl $f bottom text $s`',
  aliases: ['msg'],
  permLevel: 'User',
  requiredArgs: true
}

/**
 * Remove spaces at the start and end of the string
 * @param {String} text
 */
const clean = text => text.replace(/^\s*|\s*$/gs, '')

/**
 * @param {import('../class/sendMsg')} msg
 * @param {Array} args
 */
exports.run = async (msg, args) => {
  // Check if command is run via slash commands
  msg.setEphemeral()
  if (msg.isSlash) return msg.reply('Please use `;message` instead because slash commands is not supported.')

  let { channel, text } = msg

  /*
  Structure of the command:
  ;message 802494274238808105 Content $t Title $d Description $a author $c #000 $s $i example.com
  |______| |________________| |_____| |_________________________________________________________|
  command   msg to reply on  msg content         msg embed (check the options above)
  */

  // Get message id of the message to reply to, if there's anything
  // Valid snowflakes have 17-20 numbers (see guides/snowflakes.md)
  const replyMsgId = text.search(/[0-9]{17,21}/) === 0 ? text.match(/[0-9]{17,21}\s*/g)[0] : ''
  text = text.substring(replyMsgId.length) // remove from the text variable

  // Get message content
  /** @type {String} */
  const contentText = text.match(/^((?!\$[A-z]).)+((?=\$[A-z])|$)/s)
  const content = contentText ? contentText[0] : ''

  // Get embed
  const embedText = text.substring(content.length) // remove the content from var
  let embed
  if (embedText && embedText.match(/(?<=\$(t|d|a) *(?=\S))/s)) {
    const embData = {}
    // Check all options and add them on the embed variable as a property
    const strProperties = { a: 'authorName', r: 'authorUrl', n: 'authorIcon', t: 'title', u: 'url', d: 'description', c: 'hexColor', i: 'image', h: 'thumbnail', f: 'footerText', o: 'footerIcon' }
    for (const key of Object.keys(strProperties)) {
      const match = embedText.match(new RegExp(`(?<=\\$${key} *)((?!\\$[A-z]).)+`, 's'))
      // If there is a match then add to the `value` variable
      const value = match ? clean(match[0]) : ''
      // Store the value to the given property name
      if (value) embData[strProperties[key]] = value
    }
    // Transform embData to a message embed
    embed = new MessageEmbed(embData)
    // Set color, author, and footer values
    const { hexColor, authorName, authorUrl, authorIcon, footerText, footerIcon } = embData
    if (embData.hexColor) embed.setColor(hexColor.toUpperCase())
    if (authorName) embed.setAuthor(authorName, authorIcon, authorUrl)
    if (footerText) embed.setFooter(footerText, footerIcon)
    // Manually set the timestamp option
    // check if there is `$s`
    const time = embedText.match(/(?<=\$s *)((?!\$[A-z]).)*/s)
    // if there is a value after `$s` then use that value, if there are no values then use the current time
    if (time) {
      let timestamp = clean(time[0])
      // if string is unix time then convert it to a number
      const unixTime = timestamp.match(/^[0-9]+$/)
      timestamp = unixTime ? +unixTime[0] : new Date(timestamp || new Date())
      embed.setTimestamp(timestamp)
    }
  }

  // Set the message var to send
  /** @type {import('discord.js').Message} */
  const parsed = {}
  if (clean(content)) parsed.content = clean(content)
  if (embed && JSON.stringify(embed) !== '{}') parsed.embeds = [embed]

  // Fetch the message to reply to if there is a given message id
  /** @type {import('discord.js').Message} */
  const fetchedMsg = clean(replyMsgId) ? await channel.messages.fetch(clean(replyMsgId), { force: true }) : ''

  // Check if there are valid inputs
  if (content || embed) {
    // If the message to reply to is found, reply to that message
    if (fetchedMsg) await fetchedMsg.reply({ ...parsed, allowedMentions: { repliedUser: false } })
    // If the message is not found or there are no given message id, just send it
    else await channel.send(parsed)
  } else {
    msg.author.send({ embeds: [{ description: `I can't find a valid input in your message. Please try again. \nYour message: \`${msg.content}\`` }] })
  }

  // Delete user message
  msg.message.delete().catch(err => {
    // if the bot doesn't have permissions then dm the user
    if (err.message === 'Missing Permissions') return msg.author.send({ embeds: [{ description: `I can't delete your message because I have missing permissions in <#${channel.id}>.` }] })
    require('../modules/errorCatch')(err, msg.client, msg)
  })
}
