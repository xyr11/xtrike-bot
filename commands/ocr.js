const fetch = require('node-fetch')
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
 * @param {import('../modules/sendMsg')|import('discord.js').Message} msg
 */
const getImages = msg => {
  const links = []
  msg.attachments.forEach(attach => ['png', 'jpg', 'jpeg', 'tif', 'bmp'].indexOf(attach.contentType.substring(6)) > -1 && links.push(attach.proxyURL))
  msg.embeds.forEach(embed => embed.type === 'image' && links.push(embed.url))
  return links
}

/**
 * @param {import('../modules/sendMsg')} msg
 * @param {String[]} args
 */
exports.run = async (msg, args) => {
  await msg.setDefer()

  // variable to store images
  let imgs = []
  if (msg.isSlash) {
    // get url from string
    imgs.push(...msg.content.match(/https?:\/\/[^./]+(.|\/)([\]:;"'.](?=[^<\s])|[^\]:;"'.<\s])+/g))
  } else {
    if (msg.attachments.size) {
      // get png, jpeg, tif, and bmp files
      imgs.push(...getImages(msg))
    } else if (msg.reference) {
      // get attachments on the message that is being replied on
      const repliedTo = await msg.channel.messages.fetch(msg.reference.messageId, { force: true })
      if (repliedTo) {
        const msgImgs = getImages(repliedTo)
        if (msgImgs) imgs.push(...msgImgs)
      }
    }
    // get links
    const links = msg.content.match(/https?:\/\/[^./]+(.|\/)([\]:;"'.](?=[^<\s])|[^\]:;"'.<\s])+/g)
    if (links) imgs.push(...links)
  }
  // remove duplicate values and limit to 10 images
  imgs = [...new Set(imgs)].slice(0, 10)

  // check if there are any images given
  if (!imgs.length) return msg.reply("I didn't find any image in your message.")

  // get text in each image link and send it
  for (const img of imgs) {
    // get the text inside the image using OCR API
    // this part is an infinite loop, so if fetch() gets a FetchError
    // or if the API has IsErroredOnProcessing then it will repeat.
    // if there are no errors then the infinite loop will break
    let results
    while (results === undefined) {
      let fetched, ocrKey
      // fetch
      try {
        ocrKey = ocrKeys[Math.floor(Math.random() * ocrKeys.length)]
        fetched = await fetch('https://api.ocr.space/parse/imageurl?apikey=' + ocrKey + '&url=' + img).then(res => res.json())
      } catch (err) {
        if (err.name !== 'FetchError') {
          // stop the infinite loop if bot encountered an error NOT related to FetchError
          results = null
          require('../modules/errorCatch')(err, msg.client)
          msg.reply(`I wasn't able to find any text in \`${img}\`.`)
          continue
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
          require('./errorCatch')(new Error('All OCR API keys are ratelimited.'), msg.client)
          msg.reply(`I wasn't able to find any text in \`${img}\`.`); continue
        }
      } else {
        // api key is not ratelimited
        OcrKeys.set(ocrKey, 'ok')
        results = null
        if (fetched && !fetched.IsErroredOnProcessing) results = fetched.ParsedResults // get the text
      }
    }
    // return if encountered an error while fetching from OCR API
    if (!results) {
      msg.reply(`I wasn't able to find any text in \`${img}\`.`); continue
    }

    // extract the text from the result
    let text = results.reduce((a, b) => ({ text: (a.ParsedText || '') + ' ' + b.ParsedText }), []).text
    // filter text
    text = text.replace(/(\r?\n)+/g, '\n') // remove extra newlines
      .replace(/^\s*|\s*$/gs, '') // remove spaces before and after string

    // reply text
    if (!text) msg.reply(`I wasn't able to find any text in \`${img}\`.`)
    else msg.reply({ embeds: [{ color: botColor, description: text + `\n[(Image link)](${img})` }] })
  }
}
