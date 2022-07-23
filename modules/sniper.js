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
const zlib = require('zlib')
const errorCatch = require('../modules/errorCatch')
const got = require('got')
const { Message, MessageReaction, User } = require('discord.js') // eslint-disable-line no-unused-vars
const Snipes = require('../schemas/snipes')

// Sniper config variables so it's easier to manipulate
const maxSnipes = 15
const maxFileSize = 2 // in MB
const maxFilesPerSnipe = 3

// Export some config variables
exports.exceedMaxSnipesNotice = `Hi! I can only save up to ${maxSnipes} entries so here's the oldest one instead:`
exports.maxSnipes = maxSnipes

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
    // Limit the amount of items stored
    storedData = storedData.slice(0, maxSnipes)
    // Update the entry
    await Snipes.updateOne({ _id }, { d: storedData })
  } else {
    // If no then create a new one instead
    await new Snipes({ _id, d: [data] }).save()
  }
}

/**
 * Fetches, downloads, and compresses attachments for the sniper
 * @param {String} url url to save
 * @param {Discord.Client} client discord client for the errorCatch module
 * @param {Number} maxSize max file size it can fetch (for filtering out large files)
 */
const mediaFetch = async (url, client, maxSize = maxFileSize) => {
  // Fetch the url using got.stream to get the headers only
  // Infinite loop so it can retry fetching if there's a FetchError
  let stream
  while (stream === undefined) {
    try {
      stream = await new Promise((resolve, reject) => {
        // Stream the media
        const mediaStream = got.stream(url)
          // When the headers become available, immediately destroy the stream
          // since we only want the headers for now
          .on('response', res => {
            mediaStream.destroy()
            resolve(res)
          })
          // If there's an error then throw the error
          .on('error', error => reject(error))
      })
    } catch (err) {
      // If it's a FetchError then retry fetching, if not then log the error and stop the loop
      if (err.name !== 'FetchError') {
        errorCatch(err, client)
        stream = null
      }
    }
  }

  // If media can't be found or doesn't have 'content-length' in the header then return
  if (!stream || stream?.statusCode !== 200 || !stream?.headers['content-length']) return

  // If content length exceeds the given maxFileLength then return
  if (stream.headers['content-length'] > maxSize * 1024 * 1024) return
  // If not then fetch the whole file
  // Infinite loop so it can retry fetching if there's a FetchError
  /** @type {Buffer} */
  let buffer
  while (buffer === undefined) {
    try {
      buffer = await got(url).buffer()
    } catch (err) {
      // If it's a FetchError then retry fetching, if not then log the error and return
      if (err.name !== 'FetchError') return errorCatch(err, client)
    }
  }
  // Compress using gzip and return
  return await zlib.gzipSync(buffer)
}

/**
 * @typedef {Object} Deleted
 * @prop {String}   a   Author id
 * @prop {String}   c   Message content
 * @prop {String}   t   Created timestamp
 * @prop {Object[]} [e] Embeds
 * @prop {String[]} [f] Attachment urls
 * @prop {Object.<String, Buffer>} [m] Attachments buffers (compressed with gzip)
 * @prop {String}   [r] Message id that is being replied on
 */

/**
 * @typedef {Object} Edited
 * @prop {String}   a   Author id
 * @prop {String}   c   Message old content
 * @prop {String}   i   Message id
 * @prop {String}   t   Edited timestamp
 * @prop {Object[]} [e] Old embeds
 * @prop {String[]} [f] Old attachment urls
 * @prop {String}   [r] Message id that is being replied on
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

  // If there are attachments then try downloading them
  if (data.f?.length) {
    // Array to save buffers
    data.m = {}
    // Loop over the attachments map to get the original url instead of the proxy url
    for (const attachment of del.attachments.values()) {
      // Check if buffer array does not exceed maxFilesPerSnipe
      if (Object.keys(data.m).length <= maxFilesPerSnipe) {
        // Download the attachment from the original url
        const mediaBuf = await mediaFetch(attachment.url, del.client)
        // If download is successful add it to the snipe data
        // Array indexing uses the proxy url
        if (mediaBuf) data.m[attachment.proxyURL] = mediaBuf
      }
    }
  }

  // Store snipe data
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
