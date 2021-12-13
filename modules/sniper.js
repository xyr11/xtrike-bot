/**
 * pls snipe, editsnipe, reactionsnipe
 * Given by Dank Memer at https://github.com/DankMemer/sniper, MIT License
 */

const { Message, MessageReaction, User } = require('discord.js') // eslint-disable-line no-unused-vars
const Snipes = require('../schemas/snipes')

/**
 * Get sniped data
 * @param {String} n Types:
 * + `a` = deleted
 * + `b` = edited
 * + `c` = reactionRemoved
 * @param {String} channelId Channel id
 * @returns Snipes entry object
 */
exports.sniper = async (n, channelId) => {
  const result = await Snipes.findOne({ _id: channelId + n })
  if (result) return result.d
}

/**
 * Sniper
 * @param {'a'|'b'|'c'} type Types:
 * + `a` = deleted
 * + `b` = edited
 * + `c` = reactionRemove
 * @param {Array} args
 */
const save = async (type, args) => {
  if (!type || !args.length) return

  let _id, data
  if (type === 'a') {
    /** @type {Message} */
    const del = args[0]
    // check if given args is a partial (there's no data)
    if (del.partial) return
    // set the _id and data
    _id = del.channel.id
    data = {
      a: del.author.id,
      c: del.content,
      e: del.embeds.slice(0, 9),
      f: [...del.attachments.values()].map(a => a.proxyURL),
      t: del.createdTimestamp
    }
  } else if (type === 'b') {
    /** @type {Message} */
    const orig = args[0]
    const origFiles = [...orig.attachments.values()].map(a => a.proxyURL)
    /** @type {Message} */
    const edited = args[1]
    const editedFiles = [...edited.attachments.values()].map(a => a.proxyURL)
    // check if given args is a partial (there's no data)
    if (orig.partial) return
    // check if only the embeds are updated
    if (orig.content === edited.content && origFiles.toString() === editedFiles.toString()) return
    // set the _id and data
    _id = orig.channel.id
    data = {
      a: orig.author.id,
      c: orig.content,
      e: orig.embeds.filter(e => e.type === 'rich').slice(0, 9),
      f: origFiles,
      i: orig.id,
      t: edited.editedTimestamp
    }
  } else {
    /** @type {MessageReaction} */
    let react = args[0]
    /** @type {User} */
    const user = args[1]
    // check if given args is a partial (there's no data)
    if (react.partial) react = await react.fetch()
    // set the _id and data
    _id = react.message.channel.id
    const { id, available, name, url } = react.emoji
    data = {
      a: user.id,
      e: { id, available, name, url, s: react.emoji.toString() },
      i: react.message.id,
      t: Date.now()
    }
  }
  _id += type

  // store
  Snipes.findOne({ _id }).then(async stored => {
    // check if there are any previous entries
    if (stored) {
      let storedData = stored.d
      // convert object to array
      if (!Array.isArray(stored.d)) storedData = [stored.d]
      // add new data to array
      storedData.push(data)
      // sort from the latest one to the oldest one using the timestamp
      storedData.sort((a, b) => b.t - a.t)
      // get the last 10 items
      storedData.slice(Math.max(stored.length - 10, 0))
      // update the entry
      await Snipes.updateOne({ _id }, { d: storedData })
    } else {
      // if no then create a new one instead
      await new Snipes({ _id, d: [data] }).save()
    }
  })
}

exports.delete = (...args) => save('a', args)
exports.edit = (...args) => save('b', args)
exports.react = (...args) => save('c', args)
