const { Message, MessageAttachment } = require('discord.js') // eslint-disable-line no-unused-vars
const download = require('download')
const temp = require('temp')
const youtubeDl = require('youtube-dl-exec')

// Automatically track and cleanup files at exit
temp.track()

/**
 * Check for video links and send the raw video file using youtube-dl
 * @param {Message} message
 */
module.exports = async message => {
  // regex for getting media links
  const ytdlRegex = new RegExp('(?<=.|^|\\s)https:\\/\\/(www\\.)?' + // get "https://www."
    '(' +
      'twitter\\.com\\/[A-z0-9_]{0,15}\\/status\\/[0-9]{5,}' + // get Twitter links
      '|' +
      'tiktok\\.com\\/[@A-z0-9_]{2,25}\\/video\\/[0-9]+' + // get Tiktok links
    ')' +
    '(?=\\s|\\?|$)', 'g') // check if the next character is a space, a question mark or the end of the string

  // get links from message
  const links = message.content.match(ytdlRegex)

  // if there aren't any twitter links, return
  if (!links || !links.length) return

  for (const link of links) {
    let output

    // infinite loop
    let noData = true
    while (noData) {
      try {
        // fetch youtube-dl info
        output = await youtubeDl(link, {
          dumpSingleJson: true,
          noWarnings: true
        })
        noData = false // stop the infinite loop
      } catch (err) {
        // retry if error is 'Unable to extract data' or error 500
        if (err.stderr !== 'ERROR: Unable to extract data; please report this issue on https://yt-dl.org/bug . Make sure you are using the latest version; type  youtube-dl -U  to update. Be sure to call youtube-dl with the --verbose flag and include its complete output.' && err.stderr !== "ERROR: Unable to download webpage: <urlopen error EOF occurred in violation of protocol (_ssl.c:600)> (caused by URLError(SSLEOFError(8, 'EOF occurred in violation of protocol (_ssl.c:600)'),))") {
          await require('../modules/errorCatch')(err, message.client)
          noData = false
        }
      }
    }

    // get the formats object
    let videoLink = []
    if (output) {
      videoLink = output.formats
        .filter(a => a.protocol === 'https') // filter the .mp4 links
        .map(a => a.url) // get the url of what's left
    }

    // check if there are extracted links
    if (videoLink.length) {
      // create temp stream
      const stream = temp.createWriteStream()

      let data
      // infinite loop
      let notDownloaded = true
      while (notDownloaded) {
        try {
          // download the video from the link given. (the zero index is the lowest quality version.)
          data = await download(videoLink[1] ?? videoLink[0], { headers: output.http_headers })
          notDownloaded = false // stop the infinite loop
        } catch (err) {
          // retry if error is error 500
          if (err.code !== 500) {
            notDownloaded = false
            console.log(err)
          }
        }
      }
      // write the data to the temp file
      stream.write(data)
      stream.end()

      // create MessageAttachment
      const file = new MessageAttachment(stream.path, `${new URL(link).pathname.replace(/\W+/g, '-').slice(1)}.mp4`)
      // infinite loop
      let notSent = true
      while (notSent) {
        try {
          // reply it to the message (without pinging)
          message.reply({ files: [file], allowedMentions: { repliedUser: false } })
          notSent = false // stop the infinite loop
        } catch (err) {
          // retry if error is error 500
          if (err.code !== 500) {
            notSent = false
            console.log(err)
          }
        }
      }
    }
  }
}
