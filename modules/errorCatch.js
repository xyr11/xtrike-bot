const { Client } = require('discord.js') // eslint-disable-line no-unused-vars
const chalk = require('chalk')
const { serializeError } = require('serialize-error')
const { errLog, time, colors } = require('../config')

/** Some cute error emotes for the damned */
const errEmotes = '🐞 🐛 😕 📢 💢 🧭 📡 🧩 🚫 ❗'.split(' ')

/** Generate a random number */
const randNo = max => Math.floor(Math.random() * Math.floor(max))

/**
 * Send an error in current channel and in error logging channel, and in the console
 * @param {ErrorEvent} error Generated error
 * @param {Client} client Discord client
 * @param {Client} message Discord client
 * @param {String} title ???
 */
exports.sendErr = (error, client, message = null, title = error.name) => {
  const errEmote = errEmotes[randNo(errEmotes.length)]

  // Display it to console first
  console.error(chalk.red(`${title ?? Error} (${time()})`))
  console.error(error)

  // serialize the error object
  const err = serializeError(error)

  // 500 error codes
  const error500 = error.code >= 500 && error.code < 600

  // errors that shouldn't be sent to the current channel because they have nothing to do with the message
  const dontSendToChannel =
    error500 ||
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

  // split error log into 4089 characters (4096-7)
  const fullErr = JSON.stringify(err, undefined, 2).replaceAll('\\\\', '/').match(/(.|\s){1,4089}/g)
  fullErr.splice(10, fullErr.length - 9) // cut it up to 10 entries only
  // create embeds
  const embeds = []
  for (const i in fullErr) {
    embeds[i] = {
      color: colors.red,
      title: i === '0' ? `${errEmote} New error ${message ? `from \`${message.content}\`` : ''} at <t:${Math.floor((message ? message.createdTimestamp : Date.now()) / 1000)}>` : '',
      description: `\`\`\`\n${fullErr[i]}\`\`\``
    }
  }

  // Send the error embed to error logging channel
  if (!error500) {
    try {
      client.channels.cache.get(errLog).send({ embeds })
    } catch (err) {
      console.error(err)
    }
  }
}
