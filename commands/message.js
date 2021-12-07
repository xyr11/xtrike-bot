const { Message, MessageEmbed, MessagePayload } = require('discord.js') // eslint-disable-line no-unused-vars

exports.info = {
  name: 'message',
  category: 'Developer',
  description: 'Message as the bot',
  usage: '`$$message [messageId] [<content> and/or <embed>]`',
  option: '`[messageId]` is the message id of the message to reply to (optional)\n' +
    '`<content>` is the content of the message\n' +
    '`<embed>` is an embed. To create an embed, the options are: \n' +
`- \`$a\`: Author, \`$n\`: Author icon (url), \`$r\`: Author link (url)
- \`$t\`: Title, \`$u\`: Title link (url)
- \`$d\`: Description
- \`$c\`: Color (names on all caps like "BLUE", or hex "#042069")
- \`$i\`: Image (url), \`$h\`: Thumbnail (small image at the top) (url)
- \`$f\`: Footer, \`$o\`: Footer icon (url)
- \`$s\`: Timestamp (none, "2020-03-11", or "11:11:11 AM March 11, 2020")
You can remove extra options, but a title, description, or author is required. \n\n` +
    'Example: `;message Content $a Author $t Title $d Description $c #ffffff $f Footer $s`. Try it out to see where stuff goes, especially the embed options.',
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
 * Format string to a correct dateString
 * @param {String} input
 * @returns {Number|String} dateString
 */
const date = input => {
  const unixTime = input.match(/^[0-9]+$/)
  // if string is unix time then convert it to a number, if not then return the string
  return unixTime ? +unixTime[0] : input
}

/**
 * @param {Message} message
 * @param {Array} args
 */
exports.run = async (message, interaction, args) => {
  // check if command is run via slash commands
  if (interaction) return interaction.reply({ content: 'Please use `;message` instead because slash commands is not supported.', ephemeral: true })

  const channel = message.channel // current channel

  // text parser
  /** @type {String} */
  const text = args.join(' ')
  // sample input: `;message 802494274238808105 Content $t Title $d Description $a author $c #000 $s $i example.com`

  // get message id of the message to reply to, if there's anything
  // valid snowflakes have 17-20 numbers (see guides/snowflakes.md)
  const replyMsg = text.search(/[0-9]{17,21}/) === 0 ? text.match(/[0-9]{8,25}\s*/g)[0] : ''

  // get message content
  /** @type {String} */
  let content = text.substring(replyMsg.length).match(/^((?!\$[A-z]).)+((?=\$[A-z])|$)/s)
  content = content ? content[0] : ''

  // setup embed
  const textEmbed = text.substring(replyMsg.length + content.length)
  let embed
  const embedRgx = {
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
  const embedAddonsRgx = {
    n: (embed, value) => embed.author ? embed.setAuthor(embed.author.name, value) : '',
    r: (embed, value) => embed.author ? embed.setAuthor(embed.author.name, embed.author.iconURL || '', value) : '',
    o: (embed, value) => embed.footer ? embed.setFooter(embed.footer.text, value) : ''
  }
  if (textEmbed.match(/(?<=\$(t|d|a) *(?=\S))/s)) {
    embed = new MessageEmbed()
    // check each property of embedRgx
    for (const key of Object.keys(embedRgx)) {
      const regex = new RegExp(`(?<=\\$${key} *)((?!\\$[A-z]).)+`, 's')
      // get matches
      const match = textEmbed.match(regex)
      // if there is a match then get the value
      const value = match ? clean(match[0]) : ''
      // if there is a match then set that value to the embed
      if (value) embed[embedRgx[key]](value)
    }
    // check each property of embedAddonsRgx
    // these are passed as extra arguments in the MessageEmbed methods
    // so they are separated from embedRgx
    for (const key of Object.keys(embedAddonsRgx)) {
      const regex = new RegExp(`(?<=\\$${key} *)((?!\\$[A-z]).)+`, 's')
      const match = textEmbed.match(regex)
      const value = match ? clean(match[0]) : ''
      // if there is a match then run the function that sets the value
      if (value) embedAddonsRgx[key](embed, value)
    }

    // manually set the timestamp option
    const time = textEmbed.match(/(?<=\$s *)((?!\$[A-z]).)*/s) // check if there is `$s`
    // if there is a value after `$s` then use that value, if there are no values then use the current time
    if (time) embed.setTimestamp(date(clean(time[0])) || Date.now())
  }

  // prepare message
  /** @type {Message} */
  const finalMessage = {}
  if (content) finalMessage.content = content
  if (embed) finalMessage.embeds = [embed]

  // fetch the message if there is a given message id
  /** @type {Message} */
  let fetchedMsg
  if (replyMsg) {
    const messages = await channel.messages.fetch({ limit: 100 })
    fetchedMsg = messages.get(clean(replyMsg))
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
