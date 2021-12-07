const { Message, Interaction } = require('discord.js') // eslint-disable-line no-unused-vars
const ytdl = require('../modules/ytdl')

exports.info = {
  name: 'video',
  category: 'Miscellaneous',
  description: 'Extract videos from the given url. {{[Check out the list of supported sites.](https://ytdl-org.github.io/youtube-dl/supportedsites.html)}}',
  usage: '`$$video <url/urls> [quality]` \n You can also reply with `$$video` to a message',
  option: '`[quality]` to specify a video quality using the video height (e.g. 480)',
  permLevel: 'User',
  options: [
    { type: 3, name: 'link', description: 'The link to extract video, can be more than 1 link.', required: true },
    { type: 4, name: 'quality', description: 'Specify quality using the video height (e.g. 480).' }
  ]
}

/**
 * @param {Message} message
 * @param {Interaction} interaction
 */
exports.run = async (message, interaction, args) => {
  const thing = message || interaction
  const { client } = thing
  const linkRegex = /https?:\/\/[^./]+(.|\/)([\]:;"'.](?=[^<\s])|[^\]:;"'.<\s])+/g

  let links = []
  let matches

  if (interaction) {
    // defer reply
    await interaction.deferReply({ ephemeral: true })
    // get links from interaction
    matches = interaction.content.match(linkRegex)
    if (matches) links.push(...matches)
  } else {
    // check if there is a reply
    if (message.reference) {
      // get message that is replied to
      let repliedTo = await message.channel.messages.fetch(message.reference.messageId)
      if (!repliedTo) repliedTo = (await message.channel.messages.fetch({ limit: 100 })).get(message.reference.messageId)
      // message is fetched
      if (repliedTo) {
        // get links from message that is replied to
        matches = repliedTo.content.match(linkRegex)
        if (matches) links.push(...matches)
      }
    }
    // get links from message
    matches = message.content.match(linkRegex)
    if (matches) links.push(...matches)
  }

  // remove duplicated links
  links = [...new Set(links)]

  // get quality
  const lastArgs = args[args.length - 1]
  let quality = 480
  if (!isNaN(lastArgs)) quality = +lastArgs

  // check if there are links
  if (!links.length) {
    if (message) return message.reply("There aren't any links in the message!")
    return interaction.editReply("There aren't any links in the message!")
  }

  // send the fetching links message
  if (message) await message.reply('Fetching the links...')
  else await interaction.editReply('Fetching the links...')

  // fetch each link
  links.forEach(link => {
    ytdl(link, client, quality).then(files => {
      if (!files.length) {
        // no video
        if (message) message.reply("Seems like there's no video in", link)
        else interaction.editReply({ content: "Seems like there's no video in " + link, ephemeral: true })
      } else {
        // send video
        if (message) message.reply({ files, allowedMentions: { repliedUser: false } })
        else interaction.followUp({ files, ephemeral: true })
      }
    })
  })
}
