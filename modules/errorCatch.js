const { MessageEmbed } = require('discord.js')
const chalk = require('chalk')
const { serializeError } = require('serialize-error')
const { botName, time, discordTime, colors } = require('./base')
const { errorLogging } = require('../config')

/** Some cute error emotes for the damned */
const errEmotes = '🐞 🐛 😕 📢 💢 🧭 📡 🧩 🤦 😵‍💫 🧐 🚫 ❗'.split(' ')

/**
 * Generate a random integer from 0 to x-1
 * @param {Number} int
 */
const rand = int => Math.floor(Math.random() * int)

/** Errors to ignore completely */
const ignoreErr = err =>
  // youtube-dl errors
  err.stderr && (
    err.stderr.search("ERROR: There's no video") === 0 ||
    err.stderr.search('ERROR: Unsupported URL') === 0 ||
    err.stderr.search('ERROR: Sorry, you are not authorized to see this status') === 0 ||
    err.stderr.search('ERROR: This video is only available for registered users' === 0)
  )

/** Errors that doesn't need to be sent */
const dontSend = err =>
  (err.code >= 500 && err.code < 600) || // 500 error codes
  err.code === 50035 // Embed size exceeds maximum size of 6000

/** Errors that the user doesn't need to see */
const dontSendToChannel = err =>
  dontSend(err) ||
  err.code === 10015 || // DiscordAPIError: Unknown Webhook
  err.code === 10062 || // DiscordAPIError: Unknown interaction
  err.name === 'FetchError' // something to do with fetch() which is async

/**
 * Send an error in current channel and in error logging channel, and in the console
 * @param {Error} error
 * @param {import('discord.js').Client} client
 * @param {import('../modules/sendMsg')} msg
 */
module.exports = (error, client, msg) => {
  // Check if the error can be ignored
  if (ignoreErr(error)) return

  // Variables
  const timeSent = msg.message?.createdTimestamp || Date.now() // the time when the error occurred
  const errEmote = errEmotes[rand(errEmotes.length)] // error emote
  const errObj = serializeError(error) // serialize the error object

  // Display it to console first
  console.error(chalk.red(`${error.name || 'Error'}`), chalk.bgRedBright.black(time(timeSent)))
  console.error(error, errObj)

  // Send the error embed to corresponding channel, if there are any
  if (msg && !dontSendToChannel(error)) {
    // Footer text
    const foot = `${botName} v${process.env.npm_package_version} • ` + (rand(10) !== 1 ? 'This error will also be sent to the developers. Hang tight!' : "No one's around to help.") // an easter egg? (check http://youtu.be/o-AeEM1Nk0c)
    // Add embed
    msg.followUp({
      content: 'Sorry, seems like I have encountered an error.',
      embeds: [new MessageEmbed()
        .setTitle(`${errEmote} I have encountered an error!`)
        .setColor(colors.red)
        .setDescription(`From \`${msg.content}\` at ${discordTime(timeSent)}:\n\`\`\`${error}\`\`\``)
        .setFooter(foot)]
    })
  }

  // Check if there is a given error logging channel and if the error needs to be sent
  if (errorLogging && !dontSend(error)) {
    // Get the TextChannel
    const logChannel = client.channels.cache.get(errorLogging)
    if (!logChannel) return

    const fullErr = JSON.stringify(errObj, undefined, 1)
      .substring(1).slice(0, -1) // remove the curly brackets
      .replace(/^\s+/gm, '') // remove spaces and newlines in the start of every line
      .match(/(.|\s){1,4089}/g) // Split error log into 4089 characters (4096-7)
    fullErr.splice(10, fullErr.length - 9) // get the first ten items

    // Create embed
    const embeds = fullErr.map((val, i) => new MessageEmbed()
      .setTitle(i === 0 ? `${errEmote} Error ${msg ? `from \`${msg.content}\` ` : ''}at ${discordTime(timeSent)}` : '')
      .setColor(colors.red)
      .setDescription('```\n' + fullErr[i] + '```'))

    // Send embed
    if (embeds.length) logChannel.send({ embeds }).catch()
  }
}
