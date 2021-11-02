const { errLog, time, colors } = require('../config')
const chalk = require('chalk')
const { serializeError } = require('serialize-error')

/** Some cute error emotes for the damned */
const errEmotes = '🐞 🐛 😕 📢 💢 🧭 📡 🧩 🚫 ❗'.split(' ')

/** Generate a random number */
const randNo = max => Math.floor(Math.random() * Math.floor(max))

/**
 * Generate an error embed (in current channel and in error logging channel) and message in console
 * @param {ErrorEvent} error Generated error
 * @param {Client} client Discord client
 * @param {Client} message Discord client
 * @param {String} title ???
 */
module.exports = (error, client, message = null, title = error.name) => {
  const errEmote = errEmotes[randNo(errEmotes.length)]

  // Display it to console first
  console.error(chalk.red(`${title ?? Error} (${time()})`))
  console.error(error)

  // Internet connection error code (i think)
  // Prevent infinite looping from internet connection error, if hosted locally
  if (error.code === 500) return

  // serialize the error object
  const err = serializeError(error)

  // Send the error embed to corresponding channel, if there are any
  if (message && message.channel) {
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
        title: `${errEmote} New error ${message ? `from \`${message.content}\` at <t:${Math.floor(message.createdTimestamp / 1000)}>` : ''}`,
        description: `\n\`\`\`${JSON.stringify(err, undefined, 2).replaceAll('\\\\', '/')}\`\`\``
      }]
    })
  } catch (err) {
    console.error(err)
  }
}
