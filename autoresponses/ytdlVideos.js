const { Message } = require('discord.js') // eslint-disable-line no-unused-vars
const ytdl = require('../modules/ytdl')

// Check for video links and send the raw video file using youtube-dl
/** @param {Message} message */
module.exports = async message => {
  // if it's a `;video` command then return immediately
  if (message.content.split(/ +/g)[0].toLowerCase() === ';video') return

  // regex for getting links
  const ytdlRegex = new RegExp('(?<=.|^|\\s)https:\\/\\/(www\\.)?' + // get https://, and www. if present
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

  // get links from message and remove duplicates
  const links = [...new Set(message.content.match(ytdlRegex))]
  // fetch each link
  links.forEach(link => ytdl(link, message.client).then(files => {
    // send video
    if (files.length) message.reply({ files, allowedMentions: { repliedUser: false } })
  }))
}
