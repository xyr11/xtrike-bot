const { Message, MessageEmbed, MessagePayload } = require('discord.js') // eslint-disable-line no-unused-vars

exports.info = {
  name: 'message',
  category: 'Developer',
  description: 'Message as the bot',
  usage: '`$$message [messageId] <content> <embed>`',
  option: '`[messageId]` is the message you want to reply to (optional)\n' +
    '`<content>` is the content of the message\n' +
    '`<embed>` is an embed constructor. Example: `$t Title $d Description $a Author $u Url (link) $c Color (hex) $i Image (link) $h Thumbnail (link) $f Footer $s Timestamp (Unix time)`. You can remove extra options, but a title (`$t`) or a description (`$d`) must be present. \n\n' +
    'Sample command: `;message Content $d Description $a Author $f Footer $s`',
  aliases: ['msg'],
  permLevel: 'lmao',
  requiredArgs: true
}

/**
 * @param {Message} message
 * @param {Array} args
 */
exports.run = async (message, interaction, args) => {
  const channel = message.channel // current channel

  // text parser
  /** @type {String} */
  const text = args.join(' ')
  // sample input: `;message 802494274238808105 Content $t Title $d Description $a author $c #000 $s $i example.com`

  // get message id of the message to reply to, if there's anything
  // valid channel snowflakes has 17-20 characters comprised solely of numbers
  // see https://discord.com/developers/docs/reference#snowflakes and https://snowsta.mp/
  // tl;dr: min possible value of a snowflake is 47835198259200000 (March 13 2015, founding of discord),
  //        max is 18446744073709551615 (all 65 bytes are used)
  const replyMsg = text.search(/[0-9]{17,21}/) === 0 ? text.match(/[0-9]{8,25}\s*/g)[0] : ''

  // get message content
  let content = text.substring(replyMsg.length).match(/^((?!\$[A-z]).)+((?=\$[A-z])|$)/)
  content = content ? content[0] : ''

  // setup embed
  const textEmbed = text.substring(replyMsg.length + content.length)
  const embRgx = {
    t: 'setTitle',
    d: 'setDescription',
    a: 'setAuthor',
    u: 'setURL',
    c: 'setColor',
    f: 'setFooter',
    i: 'setImage',
    h: 'setThumbnail'
    // TODO: fields
  }
  let embed
  if (textEmbed.match(/(?<=\$(t|d) *(?=[A-z]))/s)) {
    embed = new MessageEmbed()
    // check each property of embRgx
    for (const key of Object.keys(embRgx)) {
      const regex = new RegExp(`(?<=\\$${key} *(?=[A-z]))((?!\\$[A-z]).)+`, 's')
      const match = textEmbed.match(regex)
      // if there is a match then set that value to the embed
      if (match && match[0].replace(/^\s*|\s*$/gs, '')) embed[embRgx[key]](match[0].replace(/^\s*|\s*$/gs, ''))
    }
    // manually set the timestamp option
    const textEmbHasTime = textEmbed.match(/(?<=\$s *)((?!\$[A-z]).)*/s) // check if there is $s
    if (textEmbHasTime) embed.setTimestamp(textEmbHasTime[0].replace(/^\s*|\s*$/gs, '') || Date.now()) // if there is a value after $s then use that value, if there are no values then use the current time
  }

  // prepare message
  /** @type {MessagePayload} */
  const finalMessage = {}
  if (content) finalMessage.content = content
  if (embed) finalMessage.embeds = [embed]

  // fetch the message if there is a given message id
  let fetchedMsg
  if (replyMsg) {
    const messages = await channel.messages.fetch({ limit: 100 })
    fetchedMsg = messages.get(replyMsg.replace(/^\s*|\s*$/gs, ''))
  }

  // check if input has valid content or embed
  if (content || embed) {
    // if the message is found
    if (fetchedMsg) await fetchedMsg.reply(finalMessage)
    // if the message is not found or there are no given message id
    else await channel.send(finalMessage)
  } else {
    message.author.send("There's no valid content or embed found in your message.")
  }

  // delete user message
  message.delete().catch(err => {
    // if the bot doesn't have permissions then dm the user
    if (err.message === 'Missing Permissions') return message.author.send(`I cannot delete your message because I have missing permissions in <#${channel.id}>`)
    require('../modules/errorCatch')(err, message.client, message)
  })
}
