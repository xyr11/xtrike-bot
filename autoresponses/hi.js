const { Message } = require('discord.js') // eslint-disable-line no-unused-vars

/**
 * Makes the bot reply with "hello"
 * @param {Message} message
 */
module.exports = message => {
  if (message.content === 'hi' || message.content === 'hello') {
    message.channel.send(`hello <@${message.author.id}>!`)
  }
}
