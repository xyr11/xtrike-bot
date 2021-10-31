const { errLog, time, colors } = require('../config')
const chalk = require('chalk')

/** Some cute error emotes for the damned */
const errEmotes = ['🐞', '🐛', '🚫', '❗']

// Generate a random number
const randNo = max => Math.floor(Math.random() * Math.floor(max))

/**
 * Generate an error embed (in current channel and in error logging channel) and message in console
 * @param {ErrorEvent} error Generated error
 * @param {Client} client Discord client
 * @param {Client} message Discord client
 * @param {String} title ???
 * @param {String} notes Notes regarding the error, logged on the "footer" part of the embed
 */
module.exports = (error, client, message = null, title = error.name, notes = '') => {
  const errEmote = errEmotes[randNo(errEmotes.length)]

  // Display it to console first
  console.error(chalk.red(`${title ?? Error} (${time()})`))
  console.error(error)
  if (notes) console.error('Notes:', notes)

  // Internet connection error code (i think)
  // Prevent infinite looping from internet connection error, if hosted locally
  if (error.code === 500) return

  // Then make the error embed
  const errEmbed = {
    content: 'Sorry, seems like I have encountered an error.',
    embeds: [{
      color: colors.red,
      title: `${errEmote} ${title ?? 'Error'}`,
      description: `${message ? `User command: \`${message.content}\` at <t:${Math.floor(message.createdTimestamp / 1000)}>\n` : ''}\`\`\`${error}\`\`\` \nA copy of this error message will also be sent in the error logs of the bot for logging.`,
      footer: { text: notes ?? 'Sorry for the inconvenience' },
      timestamp: Date.now()
    }]
  }

  // Send the error embed to corresponding channel, if there are any
  if (message && message.channel) {
    try {
      message.channel.send(errEmbed)
    } catch (err) {
      console.error(err)
    }
  }

  // Send the error embed to error logging channel
  try {
    client.channels.cache.get(errLog).send(errEmbed)
  } catch (err) {
    console.error(err)
  }
}
