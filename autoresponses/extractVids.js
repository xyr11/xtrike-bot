const ytdlVids = require('../modules/ytdlVids')
const { prefix } = require('../modules/base')
const videoCmdAliases = require('../commands/video').info.aliases

// Check for video links and send the raw video file using youtube-dl
/** @param {import('discord.js').Message} message */
module.exports = async message => {
  let msgContent = message.content

  // If it's a `;video` command then stop immediately
  // Check for prefix
  const prefixRegex = new RegExp(`\\s*${prefix} *`)
  if (msgContent.search(prefixRegex) === 0) {
    // If there is a prefix then remove it
    msgContent = msgContent.replace(prefixRegex, '')
    // Get the command and if it matches the ;video command, then return
    const msgCommand = msgContent.split(/ +/)[0]
    if (['video', ...videoCmdAliases].indexOf(msgCommand) > -1) return
  }

  // Regex for getting links
  const ytdlRegex = new RegExp('(?<=.|^|\\s)https:\\/\\/(www\\.)?' + // get "https://" and "www." if present
    '(' +
      'twitter\\.com\\/[A-z0-9_]{0,15}\\/status\\/[0-9]{5,}' + // get twitter.com/status/[user]/[id] links
      '|' +
      't\\.co\\/[^\\s]+' + // get t.co/ links (Twitter url shortener)
      '|' +
      'tiktok\\.com\\/[@A-z0-9_]{2,25}\\/video\\/[0-9]+' + // get tiktok.com/[user]/video/[id] links
      '|' +
      '((web|mobile|m)\\.)?facebook\\.com\\/[^\\s]+' + // get facebook.com/ links and all its subdomains
      '|' +
      'fb\\.watch\\/[^\\s]+' + // get fb.watch/ links (Facebook url shortener)
    ')' +
    '(?=\\s|\\?|$)', 'g') // check if the next character is a space, a question mark or the end of the string

  // Get links from message and remove duplicates
  const links = [...new Set(msgContent.match(ytdlRegex))]

  // Fetch each link
  links.forEach(link =>
    ytdlVids(link, message.client).then(async files => {
      // Send video source link
      if (!files) return
      return message.reply({ content: files.join('\n'), allowedMentions: { repliedUser: false } })
    })
  )
}
