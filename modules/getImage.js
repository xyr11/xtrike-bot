const { imageHash } = require('image-hash')
const fetch = require('node-fetch')
const ImagesModel = require('../schemas/images')
const { getInfo, storeInfo } = require('./botInfo')

// Hello there! Please look at guides/fetchImage.md to know more about the
// specifications of the `;image` command. Thank you!

/**
 * @typedef {Object} ConfigEntry
 * @prop {true}     f   document type is a config entry
 * @prop {String}   g   Guild id
 * @prop {String}   _id Unique guild identifier
 * @prop {Object}   d   Guild data
 * @prop {String[]} d.e Array of excluded channels
 * @prop {Number}   d.c Image count for today
 * @prop {String}   d.m Message id that initialized the `;image` command
 */

/**
 * @typedef {Object} InputEntry
 * @prop {false}   f   document type is not a config entry
 * @prop {String}  _id Message id
 * @prop {String}  g   Unique guild identifier
 * @prop {String}  c   Channel id
 * @prop {String}  a   Author id
 * @prop {String}  i   Image url
 * @prop {String}  d   Text on the image (using OCRSpace API)
 * @prop {Number}  w   Timestamp (use `getTimestamp()`)
 */

// variables and functions in creating a unique guild identifier

// internal counter
let counter = 0
const getCounter = () => counter
// when the bot starts, get the counter from the database
const syncCounter = async () => await getInfo('imageCounter').then(value => { counter = value || 0 })
syncCounter()

/** function to generate a random character */
const randChar = () => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')[Math.floor(Math.random() * 52)]

/**
 * variable for guild identifiers
 *
 * Format: Map<`guildId`, `guildIdentifier`>
 * @type {Map<String, String>}
 */
const guildIdentifiers = new Map()
const getGuildIdentifiers = () => guildIdentifiers
// also get all guild identifiers from the database
const syncGuildIdentifiers = async () => ImagesModel.find({ f: true }).then(fetchedConfig => {
  if (!fetchedConfig) return
  for (const config of fetchedConfig) guildIdentifiers.set(config.g, config._id)
})
syncGuildIdentifiers()

/**
 * Timestamp for InputEntry
 * @param {String|Number} unixTime
 */
const getTimestamp = unixTime => Math.floor(+unixTime / 1000 - 1635638400)

const imgEntry = {
  /**
   * Add new image data. Use `updateEntry` or `setEntry` instead.
   * @param {Object} object Image data
   */
  add: async object => await new ImagesModel({ ...object }).save(),

  /**
   * Get image data
   * @param {Object} query MongoDB query
   * @returns {ConfigEntry|InputEntry}
   */
  get: async query => await ImagesModel.findOne(query),

  /**
   * Get many image datas, uses the .lean() option
   *
   * Check https://mongoosejs.com/docs/tutorials/lean.html for `.lean()`
   * @param {Object} query MongoDB query
   * @param {String} options MongoDB options
   * @returns {ConfigEntry[]|InputEntry[]}
   */
  getAll: async (query, options = '') => await ImagesModel.find(query, options).lean(),

  /**
   * Update image data
   * @param {ConfigEntry|InputEntry} object The data that you want to put. The `_id` property is required.
   */
  update: async object => {
    const { _id } = object
    // check if there are any entries with the same id
    const results = await ImagesModel.find({ _id })
    // if there are, then update that one
    if (results.length) {
      delete object._id // delete the id because it wont be updated
      await ImagesModel.updateOne({ _id }, object)
    } else {
      // if there are no entries then create a new one instead
      imgEntry.add(object)
    }
  },

  /**
   * Set image data. If entry already exists, it will be overwritten by whatever you place on `object`.
   * If you don't want it to be overwritten then use `updateEntry` instead.
   * @param {ConfigEntry|InputEntry} object The data that you want to put. The `_id` property is required.
   * @param {any} oldId If you updated the `_id`, place the old `_id` here.
   */
  set: async (object, oldId = null) => {
    const { _id } = object
    // check if there are any entries with the same id
    const results = await ImagesModel.find({ _id: oldId || _id })
    // if there are, then replace that one
    if (results.length && !oldId) {
      delete object._id // delete the id because it wont be updated
      await ImagesModel.updateOne({ _id }, object)
    } else {
      // if there are no entries or `_id` is updated then create a new one instead
      await imgEntry.add(object)
      if (oldId) await imgEntry.remove(oldId)
    }
  },

  /**
   * Delete entry
   * @param {String|Number} _id The `_id` of the entry
   */
  remove: async _id => await ImagesModel.deleteOne({ _id })
}

const config = {
  activate: {
    /**
     * Activate `;image` in channel
     * @param {ConfigEntry} configEntry
     * @param {String} channelId message.channelId
     */
    channel: async (configEntry, channelId) => {
      // get the array
      const excluded = configEntry.d.e
      // remove the channel from the array
      excluded.splice(excluded.indexOf(channelId), 1)
      // update config entry
      await imgEntry.update({ _id: configEntry._id, d: { e: excluded } })
    },

    /**
     * Activate `;image` in server
     * @param {import('./sendMsg')} message message
     */
    server: async message => {
      // generate guild identifier
      counter++ // add 1 to counter
      const guildIdentifier = counter + randChar() + randChar()
      // create new config entry
      /** @type {ConfigEntry} */
      const configEntry = {
        f: true,
        g: message.guildId,
        _id: guildIdentifier,
        d: {
          e: [],
          c: 0,
          m: message.id
        }
      }
      await imgEntry.set(configEntry) // save config entry to db
      guildIdentifiers.set(message.guildId, guildIdentifier) // save to local var
      await storeInfo('imageCounter', counter) // update counter
    }
  },
  deactivate: {
    /**
     * Add channel to excluded channels
     * @param {ConfigEntry} configEntry
     * @param {String} channelId message.channelId
     */
    channel: async (configEntry, channelId) => await imgEntry.update({ _id: configEntry._id, d: { e: [...configEntry.d.e, channelId] } }),

    /**
     * Delete all data and config entry
     * @param {String} guildId message.guildId
     */
    server: async guildId => {
      await ImagesModel.deleteMany({ g: guildIdentifiers.get(guildId) }) // delete input entries
      await imgEntry.remove(guildId) // delete config entry
    }
  }
}

/**
 * Fetch image url
 * @param {String} imageUrl Url of image to fetch
 * @param {import('discord.js').Client} client Discord client
 * @returns {Promise<{ok: Boolean, buffer: Buffer, type: String}>}
 */
const fetchImageUrl = async (imageUrl, client) => {
  let ok, buffer, type
  while (ok === undefined) {
    try {
      const fetched = await fetch(imageUrl).then(res => res) // get fetched result
      ok = fetched.ok // check if image is deleted
      type = fetched.headers.get('content-type') // get image type
      buffer = await fetched.buffer() // get image buffer
    } catch (err) {
      if (err.name !== 'FetchError') {
        // stop the infinite loop if bot encountered an error NOT related to FetchError
        ok = false
        require('../modules/errorCatch')(err, client)
      }
    }
  }
  return { ok, buffer, type }
}

/**
 * Transform entries created below v0.2.0
 * @param {String} guildId
 */
const updatePreV020 = async () => {
  // find entries created below v0.2.0
  const oldDatas = await imgEntry.getAll({ data: { $exists: true } })
  // if there are none, it means that all are updated
  if (oldDatas.length === 0) return

  for (const oldData of oldDatas) {
    // please look at guides/fetchImage.md for more info!

    // get variables
    const { _id, guildId: guild, data, excludedChannels, totalToday, messageInit } = oldData

    // check if there is an updated config entry for the guild
    let guildIdentifier = guildIdentifiers.get(guild)
    if (guildIdentifier) {
      // generate guild identifier
      counter++ // add 1 to counter
      guildIdentifier = counter + randChar() + randChar()

      // add new config entry with new _id
      /** @type {ConfigEntry} */
      const configEntry = {
        f: true,
        g: guild,
        _id: guildIdentifier,
        d: {
          e: excludedChannels,
          c: totalToday,
          m: messageInit.id ?? messageInit
        }
      }
      await imgEntry.set(configEntry) // save config entry to db
      guildIdentifiers.set(guild, guildIdentifier) // save to local var
      await storeInfo('imageCounter', counter) // update counter
    }

    // add each input entry to their own input entries
    for (const d of data) {
      let { url, channel, id, author, image, text, when } = d
      id = url ? url.match(/(?<=\/)[0-9]+$/)[0] : id // extract message id from url

      // add new input entry
      /** @type {InputEntry} */
      const inputEntry = {
        f: false,
        _id: id,
        g: guildIdentifier,
        c: channel,
        a: author,
        i: image,
        d: text,
        w: getTimestamp(when)
      }
      await imgEntry.set(inputEntry) // save input entry to db
    }

    // delete old entry
    await imgEntry.remove(_id)
  }
}

/**
 * Transform `image-hash` module to a Promise
 * @param {Any} input imageHash input
 * @returns {Promise<String>}
 */
const awaitImgHash = input => new Promise((resolve, reject) => { imageHash(input, 10, true, (err, data) => { if (err) reject(err); resolve(data) }) })

// export the variables
module.exports = { ImagesModel, counter: getCounter, syncCounter, guildIdentifiers: getGuildIdentifiers, syncGuildIdentifiers, getTimestamp, imgEntry, config, fetchImageUrl, updatePreV020, awaitImgHash }
