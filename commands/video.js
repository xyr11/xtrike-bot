const ytdlVids = require('../modules/ytdlVids')

exports.info = {
  name: 'video',
  category: 'Miscellaneous',
  description: 'Extract videos from the given url. {{[Check out the list of supported sites here.](https://ytdl-org.github.io/youtube-dl/supportedsites.html)}}',
  usage: '`$$video <url/urls> [quality]` or reply with "`$$video`" to a message.',
  option: '`[quality]`: specify a video quality using the video height (e.g. `480`)',
  aliases: ['vid', 'vids', 'ytdl', 'youtube-dl'],
  permLevel: 'User',
  options: [
    { type: 3, name: 'link', description: 'The link to extract video, can be more than 1 link.', required: true },
    { type: 4, name: 'quality', description: 'Specify quality using the video height (e.g. "480").' }
  ]
}

/** @param {import('../modules/sendMsg')} msg */
exports.run = async (msg, args) => {
  const { client } = msg
  const linkRegex = /https?:\/\/[^./]+(.|\/)([\]:;"'.](?=[^<\s])|[^\]:;"'.<\s])+/g

  let links = []
  let matches

  await msg.setDefer()

  if (msg.isSlash) {
    // get links from interaction
    matches = msg.content.match(linkRegex)
    if (matches) links.push(...matches)
  } else {
    // check if there is a reply
    if (msg.reference) {
      // get message that is replied to
      let repliedTo = await msg.channel.messages.fetch(msg.reference.messageId)
      if (!repliedTo) repliedTo = (await msg.channel.messages.fetch({ limit: 100 })).get(msg.reference.messageId)
      // message is fetched
      if (repliedTo) {
        // get links from message that is replied to
        matches = repliedTo.content.match(linkRegex)
        if (matches) links.push(...matches)
      }
    }
    // get links from message
    matches = msg.content.match(linkRegex)
    if (matches) links.push(...matches)
  }

  // remove duplicated links
  links = [...new Set(links)]

  // get quality
  const lastArgs = args[args.length - 1]
  let quality = 480
  if (!isNaN(lastArgs)) quality = +lastArgs

  // check if there are links
  if (!links.length) return msg.reply("There aren't any links in the message!")

  // send the fetching links message
  await msg.reply('Fetching the links...')

  // fetch each link
  links.forEach(link => {
    ytdlVids(link, client, quality).then(files => {
      if (!files || !files.length) {
        // no video
        msg.reply({ content: `Seems like there's no video in "\`${link}\`".` })
      } else {
        // send video
        msg.followUp({ files })
      }
    })
  })
}
