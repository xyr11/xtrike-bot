const { Message, MessageAttachment } = require('discord.js') // eslint-disable-line no-unused-vars
const download = require('download')
const temp = require('temp')
const youtubeDl = require('youtube-dl-exec')
const { time } = require('../config')

// Automatically track and cleanup files at exit
temp.track()

/**
 * Check for Twitter links and get the raw video file if present
 * @param {Message} message
 */
module.exports = async message => {
  // twitter link
  let twtLink = message.content.match(/(?<=.|^|\s)https:\/\/twitter\.com\/[A-z0-9_]{0,15}\/status\/[0-9]{5,}(?=\s|\?|$)/g)
  // if there aren't any twitter links, return
  if (!twtLink || twtLink.length < 1) return
  // get first link only
  twtLink = twtLink[0]

  try {
    // fetch youtube-dl info
    youtubeDl(twtLink, {
      dumpSingleJson: true,
      noWarnings: true
    }).then(output => {
      // get the formats object
      const videoLink = output.formats
        .filter(a => a.ext === 'mp4' && a.protocol === 'https') // filter the .mp4 links
        .map(a => a.url) // get the url of what's left
      // check if there are extracted links
      if (!videoLink || videoLink.length < 1) return

      // create temp stream
      const stream = temp.createWriteStream()

      // download the video from the link given. (the zero index is the lowest quality version.)
      download(videoLink[1] ?? videoLink[0]).then(data => {
        // write the data to the temp file
        stream.write(data)
        stream.end()

        // create file
        const file = new MessageAttachment(stream.path, `twitter-${time().toLowerCase().replace(/\W+/g, '-')}.mp4`)
        // reply it to the message (without pinging)
        message.reply({ files: [file], allowedMentions: { repliedUser: false } })
      })
    })
  } catch (err) {}
}
