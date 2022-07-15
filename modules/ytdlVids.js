const youtubeDl = require('youtube-dl-exec')
const errorCatch = require('./errorCatch')

const retryIfErr = [
  'ERROR: Unable to extract data; please report this issue on https://yt-dl.org/bug . Make sure you are using the latest version; type  youtube-dl -U  to update. Be sure to call youtube-dl with the --verbose flag and include its complete output.',
  "ERROR: Unable to download webpage: <urlopen error EOF occurred in violation of protocol (_ssl.c:600)> (caused by URLError(SSLEOFError(8, 'EOF occurred in violation of protocol (_ssl.c:600)'),))"
]

/**
 * Get the video source using youtube-dl
 * @param {String} link
 * @param {import('discord.js').Client} client for logging errors
 * @param {Number} quality specify the quality of the video using the video height. if none is given, the default will be the highest quality.
 * @returns {Promise<string[] | undefined>}
 */
module.exports = async (link, client, quality) => {
  // Get youtube-dl info
  // This part is an infinite loop, so if it encounters an error then it will repeat. If not then the loop will break.
  let output
  while (output === undefined) {
    try {
      // Fetch
      output = await youtubeDl(link, {
        dumpSingleJson: true,
        noWarnings: true,
        noCallHome: true,
        noCheckCertificate: true,
        preferFreeFormats: true,
        youtubeSkipDashManifest: true
      })
    } catch (err) {
      // Check if error is 'Unable to extract data' or error 500, in which it will fetch again
      if (retryIfErr.indexOf(err.stderr) === -1) {
        // If not then stop the infinite loop and log the error
        output = null
        errorCatch(err, client)
      }
    }
  }
  // Return if youtube-dl doesn't return an output
  if (!output) return

  /**
   * Get the video source link
   * @param {Object} entry Entry or output
   * @param {import('discord.js').Client} client
   */
  const getSrc = entry => {
    // If there are no formats
    if (!entry.formats) return

    /** @type {{format: String, width: Number, height: Number, url: String, protocol: String, vcodec: String, acodec: String, filesize: Number}[]} */
    let formats = entry.formats

    // Filter out the video only / audio only / dash files
    formats = formats.filter(a => a.protocol === 'https' && a.vcodec !== 'none' && a.acodec !== 'none')

    // Pick a format from the list
    let format = formats[formats.length - 1] // Default is highest quality
    if (quality) {
      // Get the format that has the nearest value to `quality`
      format = formats.reduce((prev, curr) => {
        // If height of the previous value is closer to the quality than the height
        // of the current value then replace the current value to the previous value
        if (curr.height && Math.abs(quality - prev.height) <= Math.abs(quality - curr.height)) return prev
        // If not then return the current value
        return curr
      })
    }

    // Return undefined if there are no links
    if (!format) return

    // Return the video url
    return format.url
  }

  try {
    let sourceUrls = []

    // For extractors that have multiple entries (e.g. Facebook extractor)
    if (Array.isArray(output.entries)) {
      // Get each entry
      for (const entry of output.entries) {
        sourceUrls.push(getSrc(entry))
      }
    } else {
      // For other extractors that only has one entry
      sourceUrls.push(getSrc(output))
    }

    // Filter empty values
    sourceUrls = sourceUrls.filter(a => a)

    // Check if array is empty
    if (!sourceUrls.length) return

    // Return the source urls array
    return sourceUrls
  } catch (err) {
    // Catch errors
    errorCatch(err, client)
  }
}
