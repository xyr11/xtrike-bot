const BotCmd = require('../class/botCmd')

module.exports = new BotCmd('video')
  .setCategory('Media')
  .setDescription('Extract videos from the given url {{[(check the list of supported sites)](https://ytdl-org.github.io/youtube-dl/supportedsites.html)}}')
  .setUsage('`$$video <url/urls> [quality]` or reply with "`$$video`" to a message.')
  .setOptionText('`[quality]`: specify a video quality using the video height (e.g. `480`)')
  .setAliases(['videos', 'vid', 'vids', 'ytdl', 'youtube-dl'])
  .requiredPerm('User')
  .applicationOptions([
    { type: 3, name: 'link', description: 'The link to extract video, can be more than 1 link.', required: true },
    { type: 4, name: 'quality', description: 'Specify quality using the video height (e.g. "480").' }
  ])
  .callback(async (msg, args) => {
    await msg.setDefer() // set defer
    const { client } = msg
    const linkRegex = /https?:\/\/[^./]+(.|\/)([\]:;"'.](?=[^<\s])|[^\]:;"'.<\s])+/g

    let links = []
    let matches

    if (msg.isSlash) { // If slash commands were used
      // Get links from interaction
      matches = msg.content.match(linkRegex)
      if (matches) links.push(...matches)
    } else {
      // Check if the message is a reply, and the message that is being replied to has links
      if (msg.reference) { // Check if message is a reply
        // Fetch the message that is being replied to
        const repliedTo = await msg.channel.messages.fetch(msg.reference.messageId, { force: true })
        if (repliedTo) {
          // Get links from message that is replied to
          matches = repliedTo.content.match(linkRegex)
          if (matches) links.push(...matches)
        }
      }
      // Check links on the message
      matches = msg.content.match(linkRegex)
      if (matches) links.push(...matches)
    }

    // Remove duplicate links
    links = [...new Set(links)]

    // Check if there are links
    if (!links.length) return msg.reply("There aren't any links in the message!")

    // Get quality
    let quality
    // If last argument is a valid number then put it as the quality
    const lastArgs = args[args.length - 1]
    if (!isNaN(lastArgs)) quality = +lastArgs

    // Fetch each link
    links.forEach(link => {
      require('../modules/ytdlVids')(link, client, quality).then(async files => {
        if (!files) {
          // No video
          return msg.reply(`Sorry, I wasn't able to extract a video from "\`${link}\`".`)
        }
        // Send video source link
        return msg.reply(files.join('\n'))
      })
    })
  })
