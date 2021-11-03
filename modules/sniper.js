/**
 * pls snipe, editsnipe, reactionsnipe
 * Graciously given by Dank Memer <3
 * https://github.com/DankMemer/sniper
 * under the MIT License
 */

const { Message, MessageReaction, User } = require('discord.js') // eslint-disable-line no-unused-vars

const snipes = {}
const editSnipes = {}
const reactionSnipes = {}

// expose the variables
exports.snipes = () => snipes
exports.editSnipes = () => editSnipes
exports.reactionSnipes = () => reactionSnipes

/**
 * Save info regarding deleted message
 * @param {Message} message
 */
exports.msgDelete = async (message) => {
  if (message.partial) return // content is null or deleted embed
  const author = await message.author.fetch()
  snipes[message.channel.id] = {
    author: message.author.tag,
    avatar: author.avatarURL(),
    color: author.hexAccentColor,
    content: message.content,
    embeds: message.embeds,
    attachments: [...message.attachments.values()].map((a) => a.proxyURL),
    time: message.createdTimestamp
  }
}

/**
 * Save info regarding edited message
 * @param {Message} oldMessage
 * @param {Message} newMessage
 */
exports.msgEdit = async (oldMessage, newMessage) => {
  if (oldMessage.partial) return // content is null
  const author = await newMessage.author.fetch()
  editSnipes[oldMessage.channel.id] = {
    author: oldMessage.author.tag,
    avatar: author.avatarURL(),
    color: author.hexAccentColor,
    content: oldMessage.content,
    url: oldMessage.url,
    time: newMessage.editedTimestamp
  }
}

/**
 * Save info regarding deleted message
 * @param {MessageReaction} reaction
 * @param {User} user
 */
exports.reactRemove = async (reaction, user) => {
  if (reaction.partial) reaction = await reaction.fetch()
  const author = await user.fetch()
  reactionSnipes[reaction.message.channel.id] = {
    user: user.tag,
    avatar: author.avatarURL(),
    color: author.hexAccentColor,
    emoji: reaction.emoji,
    url: reaction.message.url,
    time: Date.now()
  }
}
