const { Message, Interaction } = require('discord.js') // eslint-disable-line no-unused-vars
const { user } = require('../modules/base')

exports.info = {
  name: 'sad',
  category: 'Miscellaneous',
  description: "Let Xtrike Bot cheer you if you're sad!",
  usage: 'sad',
  permLevel: 'User'
}

/**
 * @param {Message} message
 * @param {Interaction} interaction
 */
exports.run = async (message, interaction) => {
  const thing = message || interaction
  thing.reply(`Hey ${(user(thing)).username}, there's no room to be sad. Cheering on you through the hard times! <3`)
}
