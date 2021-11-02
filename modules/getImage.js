const chalk = require('chalk')
const fetch = require('node-fetch')
const { time, botId } = require('../config')
const ImagesModel = require('../schemas/images')

// expose the ImagesModel
/**
 * ImagesModel schema from /schemas/images.js
 */
exports.ImagesModel = ImagesModel

/**
 * Filter serverData from await ImagesModel.find({ guildId: message.guildId })
 * @param {Array} serverData array from .find()
 * @param {String} guildId message.guildId
 * @returns Filtered server data
 */
exports.filterData = (serverData, guildId) => {
  // if the server hasn't activated the `;image` command then stop the command
  if (serverData.length === 0) return null
  // if guild has more than 1 entry then this is a relatively big problem
  if (serverData.length > 1) {
    console.log(chalk.red(`ImagesModel.find in guild ${guildId} is returning more than 1 entries in image database! ${time()}`))
  }
  return serverData[0]
}
/**
 * Has the server activated the `;image` command?
 * @param {String} guildId message.guildId
 * @returns Boolean
 */
exports.isActivated = async guildId => {
  if (!guildId) throw new Error('No guildId')
  const a = await ImagesModel.find({ guildId })
  return a > 0
}

/**
 * Activate `;image` in channel
 * @param {Discord} message message
 */
exports.activateChannel = async (guildId, channelId, excludedChannels) => {
  // remove channel id to excludedChannels (https://stackoverflow.com/a/3954451/12180492)
  excludedChannels.splice(excludedChannels.indexOf(channelId), 1)
  await ImagesModel.updateOne({ guildId }, { excludedChannels })
}

/**
 * Activate `;image` in server
 * @param {Discord} message message
 */
exports.activateServer = async message => {
  // TODO: more optimized by recording all guild ids in a different data thing and then search there?
  await new ImagesModel({
    guildId: message.guildId,
    data: [],
    excludedChannels: [],
    totalToday: 0,
    messageInit: JSON.parse(JSON.stringify(message))
  }).save()
}

/**
 * Deactivate `;image` in channel
 * @param {Discord} message message
 */
exports.deactivateChannel = async (guildId, channelId, excludedChannels) => {
  // add it to serverData.excludedChannels
  await ImagesModel.updateOne({ guildId: guildId }, {
    excludedChannels: excludedChannels.concat([channelId])
  })
}

/**
 * Deactivate `;image` in server
 * @param {Discord} message message
 */
exports.deactivateServer = async guildId => {
  await ImagesModel.deleteOne({ guildId })
}

/**
 * Get image from new messages, OCR it, and record it to database
 * @param {Discord} message message
 */
exports.fetchImage = async message => {
  if (message.author.id === botId) return

  const { channelId, guildId } = message

  // get server data, if any
  const serverData = exports.filterData(await ImagesModel.find({ guildId }), guildId)

  // if the server hasn't enabled the command or if the channel is excluded then silently return
  if (!serverData || serverData.excludedChannels.indexOf(channelId) > -1) return

  // get images in message.attachments
  // for ;image and ;text functionality
  const linksFromMessage = []
  // attachments
  if (message.attachments.size > 0) {
    for (const attachment of message.attachments) {
      if (attachment[1].contentType && attachment[1].contentType.search('image/') === 0) linksFromMessage.push(attachment[1].url)
    }
  // embeds
  } else if (message.embeds) {
    for (const embed of message.embeds) {
      if (embed.type === 'image') linksFromMessage.push(embed.url)
    }
  }
  // links on message content
  const links = message.content.match(/(?<=.|^|\s)https?:\/\/[^\s]*/g)
  if (links) {
    for (const link of links) {
      // get file extension
      const fileExtension = link.match(/(?<!https?:\/\/[^/]+)(?<=\.).*/g)
      // don't push() if link is repeated!
      if (fileExtension && ['png', 'jpg', 'jpeg', 'tif', 'bmp'].indexOf(fileExtension) && linksFromMessage.indexOf(link) === -1) linksFromMessage.push(link)
    }
  }

  // the main thing
  for (const link of linksFromMessage) {
    // api key randomizer
    const apiKey = process.env.OCRSPACE_KEY2 ? [process.env.OCRSPACE_KEY, process.env.OCRSPACE_KEY2][Math.floor(Math.random() * 2)] : process.env.OCRSPACE_KEY

    // request to api
    await fetch('https://api.ocr.space/parse/imageurl?apikey=' + apiKey + '&url=' + link).then(result => result.json())
      .then(async result => {
        // TODO: instead of just adding values blindingly, we should implement a check if the image (url) to be inserted already exists in the array [https://www.npmjs.com/package/pixelmatch]

        // get array of data
        const data = serverData.data ?? []

        // check for errors
        let error = { status: false }
        if (result.IsErroredOnProcessing) {
          error = {
            status: true,
            exitCode: result.OCRExitCode,
            parsedResults: result.ParsedResults
          }
        }

        // extract the text from the result
        let text = ''
        if (!result.ParsedResults) {
          // didn't find any text
          return
        } else if (result.ParsedResults && result.ParsedResults.length > 1) {
          // function that basically makes [{c: 'a'}, {c: 'w'}, {c: 'b'}] to 'awb' but it extracts the ParsedText key
          text = result.ParsedResults.reduce((a, b) => ({ ParsedText: a.ParsedText + b.ParsedText + '' })).ParsedText
        } else if (result.ParsedResults.length === 1) {
          text = result.ParsedResults[0].ParsedText
        }

        // get author data
        let author = await message.author.fetch()
        author = JSON.parse(JSON.stringify(author))
        // remove unnecessary values (https://stackoverflow.com/a/56081419/12180492)
        author = ['id', 'tag', 'username', 'bot', 'avatarURL'].reduce((obj, key) => ({ ...obj, [key]: author[key] }), {})

        // create the object that will be placed inside the data array
        const newImage = {
          url: `https://discord.com/channels/${guildId}/${channelId}/${message.id}`,
          channel: channelId,
          image: link,
          text,
          error,
          when: Date.now(),
          author,
          processTime: process.ProcessingTimeInMilliseconds
        }
        // add to array
        data.push(newImage)

        // update data in database
        await ImagesModel.updateOne({ guildId }, { data, totalToday: +serverData.totalToday + 1 })
      })
  }
}
