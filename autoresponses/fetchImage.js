const { Message, MessageEmbed } = require('discord.js') // eslint-disable-line no-unused-vars
const got = require('got')
const { ocrApi } = require('../config')
const { counter, syncCounter, guildIdentifiers, syncGuildIdentifiers, getTimestamp, imgEntry, fetchImageUrl, updatePreV020, awaitImgHash } = require('../modules/getImage')

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

/** valid types for images */
const validTypes = ['png', 'jpg', 'jpeg', 'tif', 'bmp']

// OCR API keys
const ocrKeys = ocrApi.split('|') // multiple API keys for OCRSpace 🤔
const OcrKeys = new Map() // variable to store whether an api key is ratelimited
ocrKeys.forEach(key => OcrKeys.set(key, 'ok'))

/**
 * Get and save text in image
 * @param {Message} message
 * @param {String} imageUrl
 * @param {Number} index Index of the link
 */
const getAndSaveImage = async (message, imageUrl, index) => {
  const { client } = message

  // check if image is already on the database by using the image url
  if (await imgEntry.get({ i: imageUrl })) return

  // fetch image
  const { ok, buffer, type } = await fetchImageUrl(imageUrl, message.client)
  // check if image is deleted
  if (!ok) return

  // get hash
  const hash = await awaitImgHash({ data: buffer, ext: type })
  // check if image is already on the database using the image hash
  if (await imgEntry.get({ h: hash })) return

  // get the text inside the image using OCR API
  // this part is an infinite loop, so if `got` gets a FetchError
  // or if the API has IsErroredOnProcessing then it will repeat.
  // if there are no errors then the infinite loop will break
  let results
  while (results === undefined) {
    let fetched, ocrKey
    // fetch api
    try {
      ocrKey = ocrKeys[Math.floor(Math.random() * ocrKeys.length)]
      fetched = await got.get(`https://api.ocr.space/parse/imageurl?apikey=${ocrKey}&url=${imageUrl}`).json()
    } catch (err) {
      if (err.name !== 'FetchError') {
        // stop the infinite loop if bot encountered an error NOT related to FetchError
        results = null
        require('../modules/errorCatch')(err, client)
      }
    }
    // check if api key is ratelimited
    if (fetched === 'You may only perform this action upto maximum 500 number of times within 86400 seconds') {
      // api key is ratelimited
      OcrKeys.set(ocrKey, 'ratelimited')
      // check if every single api key is ratelimited
      if ([...OcrKeys.values()].every(a => a === 'ratelimited')) {
        // if yes then stop the loop and log it
        results = null
        require('./errorCatch')(new Error('All OCR API keys are ratelimited.'), client)
      }
    } else {
      // api key is not ratelimited
      OcrKeys.set(ocrKey, 'ok')
      results = null
      if (fetched && !fetched.IsErroredOnProcessing) results = fetched.ParsedResults // get the text
    }
  }
  // return if encountered an error while fetching from OCR API
  if (!results) return

  // extract the text from the result
  // basically what it does is make [{c: 'a'}, {c: 'w'}, {c: 'b'}] to 'a w b'
  let text = results.reduce((a, b) => ({ text: (a.ParsedText || '') + ' ' + b.ParsedText }), []).text
  // filter text
  text = text.replace(/(\r?\n)+/g, '\n') // remove extra newlines
    .replace(/^\s*|\s*$/gs, '') // remove spaces before and after string
  // return if there are no text
  if (!text) return

  const { id, channelId, guildId, author, createdTimestamp } = message
  const configEntry = await imgEntry.get({ f: true, g: guildId }) // fetch latest

  // add new entry
  const indexLetter = 'abcdefghijklmnop'.split('')[index] // convert index to letter for the _id
  /** @type {InputEntry} */
  const inputEntry = {
    f: false,
    _id: id + indexLetter,
    g: configEntry._id,
    c: channelId,
    a: author.id,
    i: imageUrl,
    d: text,
    h: hash,
    w: getTimestamp(createdTimestamp)
  }
  imgEntry.set(inputEntry)
  imgEntry.update({ _id: guildId, d: { c: configEntry.d.c + 1 } }) // config entry
}

/**
 * Get images from new messages, get the text inside each image, and add it to the database
 * @param {Message} message
 */
module.exports = async message => {
  // get images from messages
  let msgLinks = []
  // attachments
  if (message.attachments.size > 0) {
    for (const img of message.attachments) {
      // check if the content type is a valid type
      if (validTypes.indexOf(img[1].contentType.substring(6)) > -1) msgLinks.push(img[1].proxyURL)
    }
  }
  // links on message content
  const links = message.content.match(/(?<=.|^|\s)https?:\/\/[^.]+\.[^\s]+/g)
  if (links) {
    for (const link of links) {
      // get file type
      let fileType = link.match(/[^.]+$/)
      fileType = fileType[0] || ''
      // check if file type is a valid image type and check if link is repeated
      if (validTypes.indexOf(fileType) > -1 && msgLinks.indexOf(link) === -1) msgLinks.push(link)
    }
  }

  // check if there are any messages
  if (!msgLinks.length) return

  // limit to 15 images
  msgLinks = msgLinks.slice(0, 15)

  // sync local variables
  if (!counter()) await syncCounter()
  if (!guildIdentifiers().size) await syncGuildIdentifiers()

  // backward compatibility for pre-v0.2.0 entries
  updatePreV020()

  // check if command is activated in current guild
  const configEntry = await imgEntry.get({ f: true, g: message.guildId })
  // if the server hasn't enabled the command or if the channel is excluded then return
  if (!configEntry || configEntry.d.e.indexOf(message.channelId) > -1) return

  for (const i in msgLinks) {
    await new Promise((resolve, reject) => setTimeout(resolve, 100)) // add 100ms delay
    getAndSaveImage(message, msgLinks[i], i)
  }
}
