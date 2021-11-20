const { Client, Message, Interaction } = require('discord.js') // eslint-disable-line no-unused-vars
const chalk = require('chalk')
const { serializeError } = require('serialize-error')
const { time, discordTime, colors } = require('../config')

/** Some cute error emotes for the damned */
const errEmotes = '🐞 🐛 😕 📢 💢 🧭 📡 🧩 🚫 ❗'.split(' ')

/**
 * Generate a random number from 0 to x
 * @param {Number} max
 */
const randNo = max => Math.floor(Math.random() * max)

/**
 * Send an error in current channel and in error logging channel, and in the console
 * @param {ErrorEvent} error
 * @param {Client} client
 * @param {Message} message
 * @param {Interaction} interaction
 */
module.exports = (error, client, message = null, interaction = null) => {
  const thing = message || interaction
  const timeSent = thing ? thing.createdTimestamp : Date.now()
  const errEmote = errEmotes[randNo(errEmotes.length)]

  // serialize the error object
  const err = serializeError(error)

  // absolutely ignore these error
  if (
    (err.stderr && err.stderr.search("ERROR: There's no video in ") === 0) // youtube-dl no video error
  ) return

  // Display it to console first
  console.error(chalk.red(`${error.name || 'Error'} (${time()})`))
  console.error(error)

  // dont send to error logging channel
  const dontSend =
    (error.code >= 500 && error.code < 600) || // 500 error codes
    err.code === 50035 //                         Embed size exceeds maximum size of 6000
  // dont sent to the current channel
  const dontSendToChannel =
    dontSend ||
    err.code === 10062 || //        DiscordAPIError: Unknown interaction
    error.name === 'FetchError' //  something to do with fetch() which is async

  // Send the error embed to corresponding channel, if there are any
  if (!dontSendToChannel && thing) {
    try {
      const err = {
        content: 'Sorry, seems like I have encountered an error.',
        embeds: [{
          color: colors.red,
          title: `${errEmote} I have encountered an error!`,
          description: `From \`${thing.content}\` at ${discordTime(timeSent)}:\n\`\`\`${error}\`\`\``,
          footer: { text: 'This error message will also be sent to the developers. Hang tight!' }
        }]
      }
      if (message) message.reply(err)
      if (interaction) interaction.followUp(err)
    } catch (err) { }
  }

  // split error log into 4089 characters (4096-7)
  const fullErr = JSON.stringify(err, undefined, 2).replaceAll('\\\\', '/').match(/(.|\s){1,4089}/g)
  fullErr.splice(10, fullErr.length - 9) // cut it up to 10 entries only
  // create embeds
  const embeds = []
  for (const i in fullErr) {
    embeds.push({
      color: colors.red,
      title: i === '0' ? `${errEmote} New error ${thing ? `from \`${thing.content}\` ` : ''}at ${discordTime(timeSent)}` : '',
      description: `\`\`\`\n${fullErr[i]}\`\`\``
    })
  }

  // Send the error embed to error logging channel
  if (!dontSend) {
    try {
      client.channels.cache.get(process.env.ERR_LOG).send({ embeds })
    } catch (err) { }
  }
}
