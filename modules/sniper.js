/**
 * pls snipe, editsnipe, reactionsnipe
 * Given by Dank Memer at https://github.com/DankMemer/sniper, MIT License
 */

const { Message, MessageReaction, User } = require('discord.js') // eslint-disable-line no-unused-vars
const SnipesModel = require('../schemas/snipes')

/**
 * @param {String} n Types:
 * + `a` = deleted
 * + `b` = edited
 * + `c` = reactionRemoved
 * @param {String} channelId Channel id
 * @returns Snipes entry object
 */
exports.sniper = async (n, channelId) => {
  const result = await SnipesModel.findOne({ _id: channelId + n })
  if (result) return result.d
}

/**
 * Sniper
 * @param {String} n Types:
 * + `a` = deleted
 * + `b` = edited
 * + `c` = reactionRemove
 * @param {Message|MessageReaction} arg1
 * @param {Message|User} arg2
 */
exports.e = async (n, arg1, arg2 = null) => {
  if (!n || !arg1) return

  let _id, d
  if (n === 'a') {
    // arg1 is the deleted message
    if (arg1.partial) return
    _id = arg1.channel.id
    d = {
      a: arg1.author.id,
      c: arg1.content,
      e: arg1.embeds,
      f: [...arg1.attachments.values()].map((a) => a.proxyURL),
      t: arg1.createdTimestamp
    }
  } else if (n === 'b') {
    // arg1 is the old message
    // arg2 is the new message
    if (arg1.partial) return
    _id = arg1.channel.id
    d = {
      a: arg1.author.id,
      c: arg1.content,
      e: arg1.embeds,
      f: [...arg1.attachments.values()].map((a) => a.proxyURL),
      i: arg1.id,
      t: arg2.editedTimestamp
    }
  } else {
    // arg1 is the reaction object
    // arg2 is the user object
    if (arg1.partial) arg1 = await arg1.fetch()
    _id = arg1.message.channel.id
    const reactionEmoji = arg1.emoji.toJSON()
    reactionEmoji.s = arg1.emoji.toString() // string version of emoji
    d = {
      a: arg2.id,
      e: reactionEmoji,
      i: arg1.message.id,
      t: Date.now()
    }
  }
  _id += n

  // check if there are any previous entries with the same id
  SnipesModel.findOne({ _id }).then(async results => {
    // if yes then update that one
    if (results) await SnipesModel.updateOne({ _id }, { d })
    // if no then create a new one instead
    else await new SnipesModel({ _id, d }).save()
  })
}
