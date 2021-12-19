const { MessageAttachment } = require('discord.js')
const download = require('download')
const { Readable } = require('stream')
const youtubeDl = require('youtube-dl-exec')
const errorCatch = require('./errorCatch')

const retryIfErr = [
  'ERROR: Unable to extract data; please report this issue on https://yt-dl.org/bug . Make sure you are using the latest version; type  youtube-dl -U  to update. Be sure to call youtube-dl with the --verbose flag and include its complete output.',
  "ERROR: Unable to download webpage: <urlopen error EOF occurred in violation of protocol (_ssl.c:600)> (caused by URLError(SSLEOFError(8, 'EOF occurred in violation of protocol (_ssl.c:600)'),))"
]

/**
 * Function to run youtube-dl for each link simultaneously
 * @param {String} link
 * @param {import('discord.js').Client} client for logging errors
 * @param {Number} quality specify the quality using the video height. default value is the 2nd worst quality.
 */
module.exports = async (link, client, quality = 0) => {
  // get youtube-dl info
  // this part is an infinite loop, so if it encounters an error then
  // it will repeat. if there are no errors then the loop will break.
  let output
  while (output === undefined) {
    try {
      // fetch
      output = await youtubeDl(link, {
        dumpSingleJson: true,
        noWarnings: true,
        noCallHome: true,
        noCheckCertificate: true,
        preferFreeFormats: true,
        youtubeSkipDashManifest: true
      })
      // stop the infinite loop
    } catch (err) {
      // check if error is 'Unable to extract data' or error 500, in
      // which it will fetch again
      if (retryIfErr.indexOf(err.stderr) === -1) {
        // if not then stop the infinite loop and log the error
        output = null
        errorCatch(err, client)
      }
    }
  }
  // return if youtube-dl doesn't return an output
  if (!output) return

  /**
   * Function to download and send the video for all links simultaneously
   * @param {Object} entry Entry or output
   * @param {import('discord.js').Client} client
   */
  const downloadAndSend = async entry => {
    // if there are no videos
    if (!entry.formats) return

    // filter out the video only / audio only / dash files
    const formats = entry.formats.filter(a => a.protocol === 'https' && a.vcodec !== 'none' && a.acodec !== 'none')
    // pick one format
    let format = formats[1] || formats[0] // default values
    if (quality) {
      // get the format that has the nearest value to `quality`
      format = formats.reduce((prev, curr) => {
        // if height of the previous value is closer to the quality than the height
        // of the current value then replace the current value to the previous value
        if (curr.height && Math.abs(quality - prev.height) <= Math.abs(quality - curr.height)) return prev
        // if not then return the current value
        return curr
      })
    }
    // return if there are no links
    if (!format) return

    // check if the file size is too big
    if (format.filesize > 8192000) throw new Error('File too big: ' + format.url)

    // download the video from the link given
    // this part is an infinite loop, so if it encounters an error then
    // it will repeat. if there are no errors then the loop will break.
    /** @type {Buffer} */
    let buffer
    while (buffer === undefined) {
      try {
        // download the chosen link
        buffer = await download(format.url, { headers: entry.http_headers })
        // check if default quality is chosen and if video is more than 3.5 MB
        if (!quality && formats.length > 1 && Buffer.byteLength(buffer) > 3670016) {
          // download the worst quality
          buffer = await download(formats[0].url, { headers: entry.http_headers })
        }
      } catch (err) {
        // check if error code is 500 in which it will retry again
        // if not then stop the loop and log the error
        if (err.code !== 500) {
          buffer = null
          errorCatch(err, client)
        }
      }
    }
    // return if encountered an error while downloading the video
    if (!buffer) return

    return new MessageAttachment(Readable.from(buffer), link.replace(new URL(link).origin, '').slice(1).replace(/\W+/g, '-') + '.' + format.ext)
  }

  try {
    // store message attachments
    /** @type {MessageAttachment[]} */
    let files = []

    // for extractors which has multiple entries (e.g. Facebook extractor)
    if (Array.isArray(output.entries)) for (const entry of output.entries) files.push(await downloadAndSend(entry))
    // for other extractors which only has one entry given in the `output` var
    else files.push(await downloadAndSend(output))

    // filter undefined values
    files = files.filter(a => a !== undefined)
    if (!files.length) files = null
    return files
  } catch (err) {
    // check if file is too big
    if (err.message && err.message.search('File too big') === 0) return { error: 'File too big', link: err.message.replace('File too big: ', '') }
    else errorCatch(err, client)
  }
}
