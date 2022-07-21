const { Message } = require('discord.js') // eslint-disable-line no-unused-vars

/**
 * Makes the bot reply with "hello"
 * @param {Message} message
 */
module.exports = message => {
  // Check for 'hi' or 'hello' despite the capitalization
  if (message.content.search(/(hi|hello)\W*$/i) === 0) {
    message.channel.send(`hello <@${message.author.id}>!`)
  }
}
