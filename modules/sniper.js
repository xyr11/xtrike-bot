/**
 * pls snipe, editsnipe, reactionsnipe
 * by Dank Memer, from https://github.com/DankMemer/sniper
 *
 * MIT License
 *
 * Copyright (c) 2021 Dank Developers
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const Discord = require('discord.js') // eslint-disable-line no-unused-vars
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
 * Store sniped data
 * @param {String} _id
 * @param {Object} data
 */
const saveSnipe = async (_id, data) => {
  // Get previous snipe entry
  const stored = await Snipes.findOne({ _id })
  // Check if there are any previous entries
  if (stored) {
    let storedData = stored.d
    //* (For older versions) If data is an object, convert it to an array
    if (!Array.isArray(stored.d)) storedData = [stored.d]
    // Add new data to array
    storedData.push(data)
    // Sort from the latest one to the oldest one using the timestamp
    storedData.sort((a, b) => b.t - a.t)
    // Get the last 50 items
    storedData = storedData.slice(0, 50)
    // Update the entry
    await Snipes.updateOne({ _id }, { d: storedData })
  } else {
    // If no then create a new one instead
    await new Snipes({ _id, d: [data] }).save()
  }
}

/**
 * @typedef {Object} Deleted
 * @prop {String} a Author id
 * @prop {String} c Message content
 * @prop {String} t Created timestamp
 * @prop {Array}  [e] Embeds
 * @prop {Array}  [f] Attachments
 * @prop {String} [r] Message id that is being replied on
 */

/**
 * @typedef {Object} Edited
 * @prop {String} a Author id
 * @prop {String} c Message old content
 * @prop {String} i Message id
 * @prop {String} t Edited timestamp
 * @prop {Array}  [e] Old embeds
 * @prop {Array}  [f] Old attachments
 * @prop {String} [r] Message id that is being replied on
 */

/**
 * @typedef {Object} RemovedReaction
 * @prop {String} a Author id
 * @prop {Discord.ReactionEmoji|Discord.GuildEmoji} e Discord emoji
 * @prop {String} i Message id
 * @prop {String} t Removed timestamp
 */

/** @param {Discord.Message} del */
exports.delete = async del => {
  // Check if given args is a partial (there's no data)
  if (del.partial) return

  // Filter if the message content is a single character only and if there
  // are no embeds and attachments and if the message is not a reply
  if (del.content.length < 2 && !del.embeds.length && !del.attachments.size && !del.reference) return

  // Set the _id and sniper properties
  const _id = del.channel.id + 'a'
  /** @type {Deleted} */
  const data = {
    a: del.author.id,
    c: del.content,
    t: del.createdTimestamp + ''
  }
  // If there are embeds, filter out the gif embeds because they look awful and limit to 9 embeds
  if (del.embeds.length) data.e = del.embeds.filter(e => e.type !== 'gifv').slice(0, 9)
  // If there are attachments, extract the proxyUrl versions as an array
  if (del.attachments.size) data.f = [...del.attachments.values()].map(a => a.proxyURL)
  // If message is a reply, add the message id that is being replied on
  if (del.reference) data.r = del.reference.messageId

  // Store data
  await saveSnipe(_id, data)
}

/**
 * @param {Discord.Message} orig
 * @param {Discord.Message} edited
 */
exports.edit = async (orig, edited) => {
  // Check if given args is a partial (there's no data)
  if (orig.partial) return

  // Get file list of the original message and the edited message
  const origFiles = [...orig.attachments.values()].map(a => a.proxyURL)
  const editedFiles = [...edited.attachments.values()].map(a => a.proxyURL)
  // Check if only the embeds are updated
  if (orig.content === edited.content && origFiles.toString() === editedFiles.toString()) return

  // Set the _id and sniper properties
  const _id = orig.channel.id + 'b'
  const data = {
    a: orig.author.id,
    c: orig.content,
    i: orig.id,
    t: edited.editedTimestamp + ''
  }
  // If there are embeds, filter out the gif embeds because they look awful and limit to 9 embeds
  if (orig.embeds.length) data.e = orig.embeds.filter(e => e.type !== 'gifv').slice(0, 9)
  // If files have changed, add the original files
  if (origFiles) data.f = origFiles
  // If message is a reply, add the message id that is being replied on
  if (orig.reference) data.r = orig.reference.messageId

  // Store data
  await saveSnipe(_id, data)
}

/**
 * @param {Discord.MessageReaction} react
 * @param {Discord.User} user
 */
exports.react = async (react, user) => {
  // Check if given args is a partial (there's no data)
  if (react.partial) react = await react.fetch()

  // Set the _id and sniper properties
  const _id = react.message.channel.id + 'c'
  const { id, available, name, url } = react.emoji
  const data = {
    a: user.id,
    e: { id, available, name, url, s: react.emoji.toString() },
    i: react.message.id,
    t: Date.now() + ''
  }

  // Store data
  await saveSnipe(_id, data)
}
