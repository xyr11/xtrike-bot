const got = require('got')
const { botColor } = require('../modules/base')
const { ocrApi } = require('../config')

exports.info = {
  name: 'ocr',
  category: 'Media',
  description: 'Get text from an image',
  usage: 'Enter `$$ocr` and add links or attach an image, or reply `$$ocr` to a message',
  aliases: ['text'],
  permLevel: 'User',
  options: [{ type: 3, name: 'link', description: 'Image link (if many, separate with a space)', required: true }]
}

// OCR API keys
const ocrKeys = ocrApi.split('|') // multiple API keys for OCRSpace 🤔
const OcrKeys = new Map() // variable to store whether an api key is ratelimited
ocrKeys.forEach(key => OcrKeys.set(key, 'ok'))

/**
 * Get images from the Message object
 * @param {import('../class/sendMsg')|import('discord.js').Message} msg
 */
const getImages = msg => {
  const links = []
  msg.attachments.forEach(attach => ['png', 'jpg', 'jpeg', 'tif', 'bmp'].indexOf(attach.contentType.substring(6)) > -1 && links.push(attach.proxyURL))
  msg.embeds.forEach(embed => embed.type === 'image' && links.push(embed.url))
  return links
}

/**
 * @param {import('../class/sendMsg')} msg
 * @param {String[]} args
 */
exports.run = async (msg, args) => {
  await msg.setDefer()
  let imgs = [] // variable to store images

  if (msg.isSlash) {
    // Get url from string
    imgs.push(...msg.content.match(/https?:\/\/[^./]+(.|\/)([\]:;"'.](?=[^<\s])|[^\]:;"'.<\s])+/g))
  } else {
    if (msg.attachments.size) {
      // Get png, jpeg, tif, and bmp files
      imgs.push(...getImages(msg))
    } else if (msg.reference) {
      // Get attachments on the message that is being replied on
      const repliedTo = await msg.channel.messages.fetch(msg.reference.messageId, { force: true })
      if (repliedTo) {
        const msgImgs = getImages(repliedTo)
        if (msgImgs) imgs.push(...msgImgs)
      }
    }
    // Get links
    const links = msg.content.match(/https?:\/\/[^./]+(.|\/)([\]:;"'.](?=[^<\s])|[^\]:;"'.<\s])+/g)
    if (links) imgs.push(...links)
  }
  // Remove duplicate values and limit to 10 images
  imgs = [...new Set(imgs)].slice(0, 10)

  // Check if there are any images given
  if (!imgs.length) return msg.reply("I didn't find any image in your message.")

  // Get text in each image link and send it
  for (const img of imgs) {
    // Get the text inside the image using OCR API
    // This part is an infinite loop, so if `got` gets a FetchError
    // or if the API has IsErroredOnProcessing then it will repeat.
    // If there are no errors then the infinite loop will break
    let results
    while (results === undefined) {
      let fetched, ocrKey
      // Fetch api
      try {
        ocrKey = ocrKeys[Math.floor(Math.random() * ocrKeys.length)]
        fetched = await got.get(`https://api.ocr.space/parse/imageurl?apikey=${ocrKey}&url=${img}`).json()
      } catch (err) {
        if (err.name !== 'FetchError') {
          // Stop the infinite loop if bot encountered an error NOT related to FetchError
          results = null
          require('../modules/errorCatch')(err, msg.client)
          msg.reply(`I wasn't able to find any text in \`${img}\`.`)
          continue
        }
      }
      // Check if api key is ratelimited
      if (fetched === 'You may only perform this action upto maximum 500 number of times within 86400 seconds') {
        // Api key is ratelimited
        OcrKeys.set(ocrKey, 'ratelimited')
        // Check if every single api key is ratelimited
        if ([...OcrKeys.values()].every(a => a === 'ratelimited')) {
          // If yes then stop the loop and log it
          results = null
          require('./errorCatch')(new Error('All OCR API keys are ratelimited.'), msg.client)
          msg.reply(`I wasn't able to find any text in \`${img}\`.`); continue
        }
      } else {
        // Api key is not ratelimited
        OcrKeys.set(ocrKey, 'ok')
        results = null
        if (fetched && !fetched.IsErroredOnProcessing) results = fetched.ParsedResults // get the text
      }
    }
    // Return if encountered an error while fetching from OCR API
    if (!results) {
      msg.reply(`I wasn't able to find any text in \`${img}\`.`); continue
    }

    // Extract the text from the result
    let text = results.reduce((a, b) => ({ text: (a.ParsedText || '') + ' ' + b.ParsedText }), []).text
    // Filter text
    text = text.replace(/(\r?\n)+/g, '\n') // remove extra newlines
      .replace(/^\s*|\s*$/gs, '') // remove spaces before and after string

    // Reply text
    if (!text) msg.reply(`I wasn't able to find any text in \`${img}\`.`)
    else msg.reply({ embeds: [{ color: botColor, description: text + `\n[(Image link)](${img})` }] })
  }
}
