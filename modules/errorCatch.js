const { errLog, time, colors } = require('../config')
const chalk = require('chalk')
const { serializeError } = require('serialize-error')

/** Some cute error emotes for the damned */
const errEmotes = '🐞 🐛 😕 📢 💢 🧭 📡 🧩 🚫 ❗'.split(' ')

/** Generate a random number */
const randNo = max => Math.floor(Math.random() * Math.floor(max))

/** A variable for recording the current Message variable on commands for error tracking */
let msg = null

/**
 * Save the current message here
 * @param {Message} message Message
 */
exports.saveMsg = function (message) { msg = message }

/**
 * Get the current Message variable saved
 * @returns Message
 */
exports.getMsg = () => msg

/**
 * Send an error in current channel and in error logging channel, and in the console
 * @param {ErrorEvent} error Generated error
 * @param {Client} client Discord client
 * @param {Client} message Discord client
 * @param {String} title ???
 */
exports.sendErr = (error, client, message = msg, title = error.name) => {
  const errEmote = errEmotes[randNo(errEmotes.length)]

  // Display it to console first
  console.error(chalk.red(`${title ?? Error} (${time()})`))
  console.error(error)

  // serialize the error object
  const err = serializeError(error)

  // errors that shouldn't be sent to the current channel because they have nothing to do with the message
  const dontSendToChannel =
    error.code === 500 || // to prevent infinite looping from internet connection error, if hosted locally (i think)
    error.name === 'FetchError' // something to do with await fetch() which is async

  // Send the error embed to corresponding channel, if there are any
  if (message && message.channel && !dontSendToChannel) {
    try {
      message.channel.send({
        content: 'Sorry, seems like I have encountered an error.',
        embeds: [{
          color: colors.red,
          title: `${errEmote} I have encountered an error!`,
          description: `${message ? `From \`${message.content}\` at <t:${Math.floor(message.createdTimestamp / 1000)}>:\n` : ''}\`\`\`${error}\`\`\``,
          footer: { text: 'This error message will also be sent to the developers. Hang tight!' }
        }]
      })
    } catch (err) {
      console.error(err)
    }
  }

  // Send the error embed to error logging channel
  try {
    client.channels.cache.get(errLog).send({
      embeds: [{
        color: colors.red,
        title: `${errEmote} New error ${message ? `from \`${message.content}\`` : ''} at <t:${Math.floor(message.createdTimestamp / 1000)}>`,
        description: `\n\`\`\`${JSON.stringify(err, undefined, 2).replaceAll('\\\\', '/')}\`\`\``
      }]
    })
  } catch (err) {
    console.error(err)
  }
}
