const { Message, MessageAttachment } = require('discord.js') // eslint-disable-line no-unused-vars
const download = require('download')
const temp = require('temp')
const youtubeDl = require('youtube-dl-exec')
const errorCatch = require('../modules/errorCatch')

// Automatically track and cleanup files at exit
temp.track()

const retryIfErr = [
  'ERROR: Unable to extract data; please report this issue on https://yt-dl.org/bug . Make sure you are using the latest version; type  youtube-dl -U  to update. Be sure to call youtube-dl with the --verbose flag and include its complete output.',
  "ERROR: Unable to download webpage: <urlopen error EOF occurred in violation of protocol (_ssl.c:600)> (caused by URLError(SSLEOFError(8, 'EOF occurred in violation of protocol (_ssl.c:600)'),))"
]

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
    // get youtube-dl info
    // this part is an infinite loop, so if it encounters an error then
    // it will repeat. if there are no errors then the loop will break.
    let output
    let noData = true
    while (noData) {
      try {
        // fetch
        output = await youtubeDl(link, { dumpSingleJson: true, noWarnings: true })
        noData = false // stop the infinite loop
      } catch (err) {
        // check if error is 'Unable to extract data' or error 500, in
        // which it will fetch again
        if (retryIfErr.indexOf(err.stderr) === -1) {
          // if not then stop the infinite loop and log the error
          errorCatch(err, message.client)
          noData = false
        }
      }
    }
    // continue to the next link if youtube-dl doesn't return an output
    if (!output) continue

    // get the download links
    let videoLinks = []
    if (output && output.formats) {
      videoLinks = output.formats
        .filter(a => a.protocol === 'https') // filter the .mp4 links
        .map(a => a.url) // get the url of what's left
    }
    // continue to the next link if there are no available links
    if (!videoLinks.length) continue

    // create temp stream
    const stream = temp.createWriteStream()

    // download the video from the link given (zero index is the lowest quality)
    // this part is an infinite loop, so if it encounters an error then
    // it will repeat. if there are no errors then the loop will break.
    let data
    let notDownloaded = true
    while (notDownloaded) {
      try {
        // download
        data = await download(videoLinks[0], { headers: output.http_headers })
        notDownloaded = false // stop the infinite loop
      } catch (err) {
        // check if error is error 500 in which it will repeat again
        if (err.code !== 500) {
          // if not then log the error
          errorCatch(err, message.client)
          notDownloaded = false
        }
      }
    }
    // continue to the next link if video isn't downloaded
    if (!data) continue

    // write the data to the temp file
    stream.write(data)
    stream.end()
    // create MessageAttachment
    const file = new MessageAttachment(stream.path, `${new URL(link).pathname.replace(/\W+/g, '-').slice(1)}.mp4`)
    // send the video
    // this part is an infinite loop too
    let notSent = true
    while (notSent) {
      try {
        message.reply({ files: [file], allowedMentions: { repliedUser: false } }) // reply to the message (without pinging)
        notSent = false // stop the infinite loop
      } catch (err) {
        // check if error is error 500 in which it will repeat again
        if (err.code !== 500) {
          // if not then log the error
          errorCatch(err, message.client)
          notSent = false
        }
      }
    }
  }
}
