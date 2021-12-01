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
 * Function to run youtube-dl for each link simultaneously
 * @param {Message} message
 * @param {String} link
 */
const ytdl = async (message, link) => {
  // get youtube-dl info
  // this part is an infinite loop, so if it encounters an error then
  // it will repeat. if there are no errors then the loop will break.
  let output
  while (output === undefined) {
    try {
      // fetch
      output = await youtubeDl(link, { dumpSingleJson: true, noWarnings: true })
      // stop the infinite loop
    } catch (err) {
      // check if error is 'Unable to extract data' or error 500, in
      // which it will fetch again
      if (retryIfErr.indexOf(err.stderr) === -1) {
        // if not then stop the infinite loop and log the error
        output = null
        errorCatch(err, message.client)
      }
    }
  }
  // return if youtube-dl doesn't return an output
  if (!output) return

  /**
   * Function to download and send the video for all links simultaneously
   * @param {Message} message
   * @param {String} givenLink For the filename
   * @param {Object} entry Entry or output
   */
  const downloadAndSend = async (message, givenLink, entry) => {
    /** @type {String[]} */
    let videoLinks = []
    if (entry.formats) {
      videoLinks = entry.formats
        .filter(a => a.protocol === 'https' && a.ext === 'mp4') // filter the .mp4 links
        .map(a => a.url) // get the url of what's left
    }
    // return if there are no download links
    if (!videoLinks.length) return

    // create temp stream
    const stream = temp.createWriteStream()

    // download the video from the link given (zero index is the lowest quality)
    // this part is an infinite loop, so if it encounters an error then
    // it will repeat. if there are no errors then the loop will break.
    let data
    while (data === undefined) {
      try {
        // download
        data = await download(videoLinks[0], { headers: entry.http_headers })
        // stop the infinite loop
      } catch (err) {
        // check if error is error 500 in which it will repeat again
        if (err.code !== 500) {
          // if not then log the error
          data = null
          errorCatch(err, message.client)
        }
      }
    }
    // return if encountered an error while downloading the video
    if (!data) return

    // write the data to the temp file
    stream.write(data)
    stream.end()

    // create MessageAttachment
    const file = new MessageAttachment(stream.path, new URL(givenLink).pathname.replace(/\W+/g, '-').slice(1) + '.mp4')
    // reply to the message (without pinging)
    message.reply({ files: [file], allowedMentions: { repliedUser: false } })
  }

  // for extractors which has multiple entries given in the `output.entries` var (e.g. Facebook extractor)
  if (Array.isArray(output.entries)) output.entries.forEach(entry => downloadAndSend(message, link, entry))
  // for other extractors which only has one entry given in the `output` var
  else downloadAndSend(message, link, output)
}

/**
 * Check for video links and send the raw video file using youtube-dl
 * @param {Message} message
 */
module.exports = async message => {
  // regex for getting links
  const ytdlRegex = new RegExp('(?<=.|^|\\s)https:\\/\\/(www\\.)?' + // get "https://www."
    '(' +
      'twitter\\.com\\/[A-z0-9_]{0,15}\\/status\\/[0-9]{5,}' + // get "twitter.com/status/[user]/[id]" links
      '|' +
      't\\.co\\/[^\\s]+' + // get "t.co/" links (Twitter url shortener)
      '|' +
      'tiktok\\.com\\/[@A-z0-9_]{2,25}\\/video\\/[0-9]+' + // get "tiktok.com/[user]/video/[id]" links
      '|' +
      '((web|mobile|m)\\.)?facebook\\.com\\/[^\\s]+' + // get "facebook.com/" links and all its subdomains
      '|' +
      'fb\\.watch\\/[^\\s]+' + // get "fb.watch/" links (Facebook url shortener)
    ')' +
    '(?=\\s|\\?|$)', 'g') // check if the next character is a space, a question mark or the end of the string

  // get links from message and remove duplicates
  const links = [...new Set(message.content.match(ytdlRegex))]
  // run youtube-dl for all links simultaneously
  links.forEach(link => ytdl(message, link))
}
