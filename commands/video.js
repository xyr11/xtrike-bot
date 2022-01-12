const { MessageEmbed } = require('discord.js')
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

  if (msg.isSlash) {
    // Get links from interaction
    matches = msg.content.match(linkRegex)
    if (matches) links.push(...matches)
  } else {
    // Check if there is a reply
    if (msg.reference) {
      // Get message that is being replied on
      const repliedTo = await msg.channel.messages.fetch(msg.reference.messageId, { force: true })
      // Message is fetched
      if (repliedTo) {
        // Get links from message that is replied to
        matches = repliedTo.content.match(linkRegex)
        if (matches) links.push(...matches)
      }
    }
    // Get links from message
    matches = msg.content.match(linkRegex)
    if (matches) links.push(...matches)
  }

  // Remove duplicated links
  links = [...new Set(links)]

  // Get quality
  const lastArgs = args[args.length - 1]
  let quality = 480
  if (!isNaN(lastArgs)) quality = +lastArgs

  // Check if there are links
  if (!links.length) return msg.reply("There aren't any links in the message!")

  // Fetch each link
  links.forEach(link => {
    ytdlVids(link, client, quality).then(async files => {
      if (!files) {
        // No video
        await msg.reply(`I wasn't able to find a video in "\`${link}\`".`)
      } else if (files.error === 'File too big') {
        // File too big
        await msg.reply({
          content: 'File too big to upload.',
          embeds: [new MessageEmbed()
            .setDescription(`The video format that I found is too big to upload. \n You can download the video directly [in this link](${files.link}).`)
            .setFooter({ text: 'Note that the link may expire quickly' })]
        })
      } else {
        // Send video
        msg.reply({ files })
      }
    })
  })
}
