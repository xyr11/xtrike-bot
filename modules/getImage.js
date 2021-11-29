const { Message } = require('discord.js') // eslint-disable-line no-unused-vars
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
// also get all guild identifiers from the database
const syncGuildIdentifiers = async () => ImagesModel.find({ f: true }).then(fetchedConfig => {
  if (!fetchedConfig) return
  for (const config of fetchedConfig) guildIdentifiers.set(config.g, config._id)
})
syncGuildIdentifiers()
const getGuildIdentifiers = () => guildIdentifiers

/**
 * Timestamp for InputEntry
 * @param {String|Number} unixTime
 */
const getTimestamp = unixTime => Math.floor(+unixTime / 1000 - 1635638400)

/**
 * Store bot info
 * @param {ConfigEntry|InputEntry} object Data. Please note that the `_id` property is required.
 */
const setImageDb = async object => {
  const { _id } = object
  // check if there are any previous entries with the same id
  const results = await ImagesModel.find({ _id })
  // if yes then update that one
  if (results.length) {
    delete object._id // delete the id because it wont be updated
    await ImagesModel.findOneAndReplace({ _id }, object)
  } else {
    // if no then create a new one instead
    await new ImagesModel({ ...object }).save()
  }
}

/**
 * Get bot info of one document
 * @param {Object} query
 * @returns {ConfigEntry|InputEntry} Stored data, using `.lean()` (check https://mongoosejs.com/docs/tutorials/lean.html)
 */
const getImageDb = async query => {
  const result = await ImagesModel.findOne(query)
  if (result) return result
}

/**
 * check if the config entry of a guild is present
 * @param {String} guildId message.guildId
 * @returns {Boolean}
 */
const isActivated = async guildId => !!await getImageDb({ f: true, g: guildId })

/**
 * Activate `;image` in channel
 * @param {ConfigEntry} configEntry
 * @param {String} channelId message.channelId
 */
const activateChannel = async (configEntry, channelId) => {
  // get the array
  const excluded = configEntry.d.e
  // remove the channel from the array
  excluded.splice(excluded.indexOf(channelId), 1)
  // update config entry
  await setImageDb({ _id: configEntry._id, d: { e: excluded } })
}

/**
 * Activate `;image` in server
 * @param {Message} message message
 */
const activateServer = async message => {
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
  await setImageDb(configEntry) // save config entry to db
  guildIdentifiers.set(message.guildId, guildIdentifier) // save to local var
  await storeInfo('imageCounter', counter) // update counter
}

/**
 * Add channel to excluded channels
 * @param {ConfigEntry} configEntry
 * @param {String} channelId message.channelId
 */
const deactivateChannel = async (configEntry, channelId) => await setImageDb({ _id: configEntry._id, d: { e: [...configEntry.d.e, channelId] } })

/**
 * Delete all data and config entry
 * @param {String} guildId message.guildId
 */
const deactivateServer = async guildId => {
  await ImagesModel.deleteMany({ g: guildIdentifiers.get(guildId) }) // delete input entries
  await ImagesModel.deleteOne({ g: guildId }) // delete config entry
}

/**
 * Transform entries created below v0.2.0
 * @param {String} guildId
 */
const updatePreV020 = async () => {
  // find entries created below v0.2.0
  // for `.lean()`: https://mongoosejs.com/docs/tutorials/lean.html
  const oldDatas = await ImagesModel.find({ data: { $exists: true } }).lean()
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
      await setImageDb(configEntry) // save config entry to db
      guildIdentifiers.set(guild, guildIdentifier) // save to local var
      await storeInfo('imageCounter', counter) // update counter
    }

    // add each input entry to their own input entries
    for (const d of data) {
      let { url, channel, id, author, image, text, when } = d
      id = url ? url.match(/(?<=\/)[0-9]+$/)[0] : id // extract message id from url

      console.log(guildIdentifier, id, channel, getTimestamp(when))

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
      await setImageDb(inputEntry) // save input entry to db
    }

    // delete old entry
    await ImagesModel.deleteOne({ _id })
  }
}

/**
 * Get images from new messages, get the text inside each image, and add it to the database
 * @param {Message} message
 */
const fetchImage = async message => {
  const { id, channelId, guildId } = message
  const validTypes = ['png', 'jpg', 'jpeg', 'tif', 'bmp']

  // get images from messages
  const msgLinks = []
  // attachments
  if (message.attachments.size > 0) {
    for (const img of message.attachments) {
      // check if the content type is a valid type
      if (validTypes.indexOf(img[1].contentType.substring(6)) > -1) msgLinks.push(img[1].url)
    }
  }
  // links on message content
  const links = message.content.match(/(?<=.|^|\s)https?:\/\/[^\s]*/g)
  if (links) {
    for (const link of links) {
      // get file type
      let fileType = link.match(/[^.]+$/)
      fileType = fileType[0] || ''
      // check if file type is an image (that OCRSpace can process) and check if link is repeated
      if (validTypes.indexOf(fileType) > -1 && msgLinks.indexOf(link) === -1) msgLinks.push(link)
    }
  }

  // check if there are any messages
  if (!msgLinks.length) return

  // sync local variables
  if (!counter) await syncCounter()
  if (!guildIdentifiers.size) await syncGuildIdentifiers()

  // backward compatibility for pre-v0.2.0 entries
  await updatePreV020()

  // check if command is activated in current guild
  const configEntry = await getImageDb({ f: true, g: guildId })
  // if the server hasn't enabled the command or if the channel is excluded then return
  if (!configEntry || configEntry.d.e.indexOf(channelId) > -1) return

  for (const link of msgLinks) {
    // TODO: instead of just adding values blindingly, we should implement a check if the image (url) to be inserted already exists in the array [https://www.npmjs.com/package/pixelmatch]

    // request to api
    let noData = true
    const apiKeys = process.env.OCRSPACE_KEY.split('|') // multiple API keys for OCRSpace 🤔

    let results

    // infinite loop
    // if fetch() gets a FetchError or if the API has IsErroredOnProcessing
    // then repeat the fetch(), but if not then break the infinite loop
    while (noData) {
      let fetched
      try {
        fetched = await fetch('https://api.ocr.space/parse/imageurl?apikey=' + apiKeys[Math.floor(Math.random() * apiKeys.length)] + '&url=' + link).then(res => res.json()) // get the text inside the image using OCRSpace API
      } catch (err) {
        if (err.name !== 'FetchError') {
          // stop the infinite loop if bot encountered an error NOT related
          // to FetchError
          noData = false
          require('../modules/errorCatch')(err, message.client, message)
        }
      }
      results = fetched.ParsedResults
      // stop the infinite loop if there are no errors
      if (!fetched.IsErroredOnProcessing) noData = false
    }

    // extract the text from the result
    let text = ''
    if (!results) {
      return // didn't find any text
    } else if (results.length === 1) {
      text = results[0].ParsedText
    } else if (results.length > 1) {
      // function that basically makes [{c: 'a'}, {c: 'w'}, {c: 'b'}] to
      // 'a w b' but it instead extracts the ParsedText property
      text = results.reduce((a, b) => ({ r: a.ParsedText + ' ' + b.ParsedText })).r
    }
    // add new entry
    /** @type {InputEntry} */
    const inputEntry = {
      f: false,
      _id: id,
      g: configEntry._id,
      c: channelId,
      a: message.author.id,
      i: link,
      d: text,
      w: getTimestamp(message.createdTimestamp)
    }
    await setImageDb(inputEntry)
    // update config entry in database
    await setImageDb({ _id: guildId, d: { c: configEntry.d.c + 1 } })
  }
}

// export the variables
module.exports = { ImagesModel, guildIdentifiers: getGuildIdentifiers, setImageDb, getImageDb, isActivated, activateChannel, activateServer, deactivateChannel, deactivateServer, updatePreV020, fetchImage }
