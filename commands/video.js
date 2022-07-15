const ytdlVids = require('../modules/ytdlVids')

exports.info = {
  name: 'video',
  category: 'Media',
  description: 'Extract videos from the given url. {{[Check out the list of supported sites here.](https://ytdl-org.github.io/youtube-dl/supportedsites.html)}}',
  usage: '`$$video <url/urls> [quality]` or reply with "`$$video`" to a message.',
  option: '`[quality]`: specify a video quality using the video height (e.g. `480`)',
  aliases: ['videos', 'vid', 'vids', 'ytdl', 'youtube-dl'],
  permLevel: 'User',
  options: [
    { type: 3, name: 'link', description: 'The link to extract video, can be more than 1 link.', required: true },
    { type: 4, name: 'quality', description: 'Specify quality using the video height (e.g. "480").' }
  ]
}

/**
 * @param {import('../class/sendMsg')} msg
 * @param {String[]} args
 */
exports.run = async (msg, args) => {
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
    ytdlVids(link, client, quality).then(async files => {
      if (!files) {
        // No video
        return msg.reply(`Sorry, I wasn't able to extract a video from "\`${link}\`".`)
      }
      // Send video source link
      return msg.reply(files.join('\n'))
    })
  })
}
