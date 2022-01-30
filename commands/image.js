const { MessageEmbed } = require('discord.js')
const Fuse = require('fuse.js')
const getPixels = require('get-pixels')
const { prefix, colors, userPerms } = require('../modules/base')
const { config: imgConfig, imgEntry, fetchImageUrl, updatePreV020, guildIdentifiers, awaitImgHash } = require('../modules/getImage')

exports.info = {
  name: 'image',
  category: 'Media',
  description: 'Search for text in images. {{By default, it searches for images sent until 8 months ago and from the current channel only.}}',
  usage: '`$$image [options] <words>`',
  option: '`--server` to include images on other channels\n' +
    '`--all` to include images sent 8+ months ago\n' +
    '`--disable <channel|server>`\n' +
    '`--enable <channel|server>`',
  aliases: ['images', 'img'],
  permLevel: 'User',
  requiredArgs: true,
  options: [
    { type: 3, name: 'search', description: 'The words to search' },
    { type: 5, name: '--server', description: 'Include images on other channels (default: false)' },
    { type: 5, name: '--all', description: 'Include images sent 8+ months ago (default: false)' },
    {
      type: 3,
      name: '--disable',
      description: 'Disable the command in the current server or channel',
      choices: [
        { name: 'server', value: 'server' },
        { name: 'channel', value: 'channel' }
      ]
    },
    {
      type: 3,
      name: '--enable',
      description: 'Enable the command in the current server or channel',
      choices: [
        { name: 'server', value: 'server' },
        { name: 'channel', value: 'channel' }
      ]
    }
  ]
}

// Hello there! Please look at guides/fetchImage.md to know more about the
// specifications of the `;image` command. Thank you!

// an object that stores a map of processed results for every instance of the ;image command
/** @type {Map<String, MessageEmbed|undefined>[]} */
const maps = {}

/**
 * Check the number of results in a `maps` instance
 * @example
 * [0: 'bar', 1: 'foo', 2: 'baz'] => 3
 * [0: undefined, 1: 'baz'] => 2
 * [0: 'foo', 1: 'bar', 3: 'baz'] => 2
 * @param {String} instance the instance of the map in the object
 * @returns {undefined|Number}
 */
const valuesCount = instance => {
  // The map to check
  const map = maps[instance]
  if (!map) return
  let count = 0
  // Check every entry
  for (let i of map.keys()) {
    // Convert to number
    i = +i
    // Check if the index i-1 exists
    // Ignore if the item to be checked is zero
    if (i === 0 || map.has(i - 1 + '')) {
      count++
    } else {
      // If index i-1 doesn't exists, it means that there's a skipped index
      // Return how many index in order are there
      return count
    }
  }
  // Return how many values are there
  return count
}

/**
 * Check the number of results in a `maps` instance
 * @example
 * [0: undefined, 1: 'baz'] => 1
 * [0: 'baz', 1: 'foo', 2: undefined, 3: 'bar', 4: undefined] => 3
 * [0: 'foo', 1: 'bar', 3: 'baz'] => 2
 * @param {String} instance the instance of the map in the object
 * @returns {undefined|Number}
 */
const filteredValCount = instance => {
  // The map to check
  const map = maps[instance]
  if (!map) return
  let count = 0
  // Check every entry
  for (let i of map.keys()) {
    // Convert to number
    i = +i
    // Check if previous index exists
    // Ignore if the item to be checked is zero
    if (i === 0 || map.has(i - 1 + '')) {
      // Check if the value of the index is not undefined
      if (map.get(i + '')) count++
    } else {
      // If index i-1 doesn't exists, it means that there's a skipped index
      // Return how many index in order are not undefined
      return count
    }
  }
  // Return how many values are not undefined
  return count
}

/**
 * Check if searchResults is processed already and returns the map
 * @param {String} id index of the instance of the map
 * @param {Number} maxResults
 * @returns {[String, Object][]}
 */
const processedArr = async (id, maxResults) => {
  let map
  while (!map) {
    // The bot checks every 80 milliseconds whether:
    // The map has processed ALL ENTRIES (including `undefined` values)
    // OR if the map, when the `undefined` values are filtered, has AT LEAST 10 VALUES
    // If true, then it means that the map has finished processing
    await new Promise((resolve, reject) => setTimeout(resolve, 80))
    if (valuesCount(id) >= maxResults || filteredValCount(id) >= 10) map = [...maps[id]]
  }
  return map
}

/**
 * Get the most "popular" color
 * @param {Buffer} buffer image buffer
 * @param {String} type content type of image
 * @returns {Number[]} RGB values. 1st value is red, 2nd is green, 3rd is blue
 */
const popularColor = async (buffer, type) => {
  // Get pixel array data
  /** @type {Uint8Array[]} */
  const data = await new Promise((resolve, reject) => getPixels(buffer, type, (err, data) => err ? reject(err) : resolve(data)))
  const pixels = data.data
  // Get the size of the array (each pixel occupies 4 values)
  const size = pixels.length
  // Map to store colors
  const rgbMap = new Map()

  // Get the "popularity" of colors by using rgb values
  let i = -4 // the "cursor" for the buffer data
  const blockSize = Math.ceil((size / 4) / 18000) // only visit every x pixels
  const nearestClr = num => Math.round(num / 20) * 20 < 255 ? Math.round(num / 20) * 20 : 255 // round to nearest 20
  while ((i += blockSize * 4) < size) {
    // Check every x pixels and get their rounded pixel values
    const pxl = [nearestClr(pixels[i]), nearestClr(pixels[i + 1]), nearestClr(pixels[i + 2])].toString() // round to nearest 20
    // Add 1 to the count of the rounded pixel value to the map
    rgbMap.set(pxl, (rgbMap.get(pxl) || 0) + 1)
  }

  // Sort the map from the most "popular" color
  const rgb = [...rgbMap].sort((a, b) => b[1] - a[1])
  const parse = str => JSON.parse(`[${str.split(',')}]`) // convert string to array
  if (
    rgb.length > 2 && // check if there are more than 2 entries
    ['0,0,0', '20,20,20', '240,240,240', '255,255,255'].indexOf(rgb[0][0]) > -1 && // check if most popular color is white/black
    rgb[0][1] * 0.3 < rgb[1][1] // check if the next value is at least 30% as popular as the most popular color
  ) {
    return parse(rgb[1][0]) // return the 2nd most popular color
  } else {
    return parse(rgb[0][0]) // return the most popular color
  }
}

/**
 * basically what this does is it checks if the image has been deleted, gets the dominant color for the embed, and also fetches the user that sent it. it then places it on the given map
 * @param {Object} data Data from database
 * @param {String} index index of data for ranking
 * @param {import('discord.js').Client} client for error logging
 * @param {Map} map the map to place data in
 */
const fetchEach = async (data, index, client, map) => {
  // Variables
  const { item } = data
  const { _id, c: channel, a: author, i: image, w: timestamp } = item
  const msgId = _id.match(/[0-9]{17,20}/)[0] // get the message id from _id
  // Fetch image
  const { ok, buffer, type } = await fetchImageUrl(image, client)
  // Check if image is deleted
  if (!ok) {
    map.set(index, undefined) // set to undefined
    return imgEntry.remove(_id) // delete entry
  }
  // Get hash
  const hash = item.h || await awaitImgHash({ data: buffer, ext: type })
  if (!item.h) imgEntry.update({ _id, h: hash }) // add hash to db if there isn't one yet
  // Get the most popular color in image
  const color = await popularColor(buffer, type)
  // Fetch user data
  const user = await client.users.cache.get(author).fetch()
  // Add data
  map.set(index, { channel, msgId, user: user.tag, avatar: user.avatarURL(), color, image, timestamp: (timestamp + 1635638400) * 1000, _id, hash })
}

// text to reply
const msgNotEnabled = `A moderator or admin hasn't enabled this command yet. \nTo enable it, enter \`${prefix}image --enable\``
const msgDisableWarning = "When you disable the image command, you won't be able to use it until a moderator enables it back again. It will also remove ALL data regarding images sent so you wouldn't be able to search for them again. \nAre you really sure about this? Enter `" + prefix + 'image --disable server YES` to go ahead.'

/**
 * @param {import('../class/sendMsg')} msg
 * @param {Array} args
 */
exports.run = async (msg, args) => {
  const { id, channelId, guildId } = msg
  msg.setEphemeral()
  await msg.setDefer() // defer reply

  // Set the instance of the map
  maps[id] = new Map()

  // Backward compatibility for pre-v0.2.0 entries
  await updatePreV020()

  // Get server data
  const configEntry = await imgEntry.get({ f: true, g: guildId })
  // Check if current channel is excluded
  const isExcluded = configEntry.d.e.indexOf(channelId) > -1

  // Activate/deactivate command
  if (args[0] === '--activate' || args[0] === '--enable') {
    // Check user permission level
    if (userPerms(msg) < 2) return msg.reply('You need to be at least a moderator to be able to do this.')
    if (args[1] === 'channel') {
      // Activate channel
      // Check if command is not activated in server
      if (!configEntry) return msg.reply(msgNotEnabled)
      // Check if channel is not excluded
      if (!isExcluded) return msg.reply(`This channel is already enabled. By default, all channels are enabled. \nTo disable a channel, try \`${prefix}image --disable channel\`.`)
      await imgConfig.activate.channel(configEntry, channelId)
      return msg.reply('Successfully included this channel for image monitoring.')
    } else if (!args[1] || (args[1] && args[1] === 'server')) {
      // Activate server
      // Check if command is already activated
      if (configEntry) return msg.reply('You have enabled this server already!')
      await imgConfig.activate.server(msg.message)
      return msg.reply({
        content: 'Success!',
        embeds: [{ description: `:green_circle: Successfully enabled the \`${prefix}image\` command for this server`, color: colors.green }]
      })
    }
  } else if (args[0] === '--deactivate' || args[0] === '--disable') {
    // Check user permission level
    if (userPerms(msg) < 2) return msg.reply('You need to be at least a moderator to be able to do this.')
    // Check if command is not activated in server
    if (!configEntry) return msg.reply(msgNotEnabled)
    if (!args[1]) {
      // Deactivate server warning
      msg.reply(msgDisableWarning)
    } else if (args[1] === 'channel') {
      // Deactivate channel
      if (isExcluded) {
        return msg.reply('This channel is already excluded!')
      }
      await imgConfig.deactivate.channel(configEntry, channelId)
      return msg.reply('Successfully excluded this channel for image monitoring.')
    } else if (args[1] === 'server') {
      // Show deactivate server warning
      if (args[2].toLowerCase() !== 'yes') return msg.reply(msgDisableWarning)
      await imgConfig.deactivate.server(guildId)
      return msg.reply('Successfully disabled this command!')
    }
  }

  // Return silently if server hasn't activated the command yet
  if (!configEntry || isExcluded) return

  // Function to check if the given option is present in `args`
  const option = option => args.indexOf(option) > -1 && args.indexOf(option)

  // Get image data from collection entry
  let data
  if (option('--server')) {
    // Search for images in the whole server
    args.splice(option('--server'), 1) // remove `--server`
    data = await imgEntry.getAll({ g: guildIdentifiers().get(guildId) }, '-f -g')
  } else {
    // Search for images in the current channel only (default)
    data = await imgEntry.getAll({ c: channelId }, '-f -g')
  }

  // ? `--here`: search for images in the current channel (deprecated because it's already the default)
  if (option('--here')) args.splice(option('--here'), 1) // remove `--here`

  // Filter old images
  if (option('--all')) {
    // `--all`: search for images regardless of how old it is
    args.splice(option('--all'), 1) // remove `--all`
  } else {
    // Filter images sent 32 weeks (~8 months) or earlier (default)
    // 32 weeks in unix time is 1000*60*60*24*7*32 = 19353600000
    data = data.filter(obj => obj.w >= (Date.now() - 19353600000) / 1000 - 1635638400)
  }

  // Filter empty values
  data = data.reduce((prev, curr) => {
    if (!curr.d) {
      // Remove entries with empty values from the array
      imgEntry.remove(curr._id)
      return [...prev] // remove it from the array too
    }
    return [...prev, curr]
  }, [])

  // Set the search options
  const fuse = new Fuse(data, {
    // isCaseSensitive: false,
    // includeScore: false,
    // shouldSort: true,
    // includeMatches: false,
    minMatchCharLength: 2,
    // findAllMatches: false,
    // location: 0,
    threshold: 0.45,
    // distance: 100,
    ignoreLocation: true,
    ignoreFieldNorm: true,
    keys: ['d']
  })

  // Search the object
  /** @type {Object[]} */
  let results = fuse.search(args.join(' '))
  // Check if there are any results
  if (!results.length) return msg.reply({ content: 'Sorry, I wasn\'t able to find images that contain that text.' })
  // Process each result
  for (const r in results) {
    // Check whether all results have been processed (including `undefined` values)
    // or if the map has at least 10 values (`undefined` values are not counted)
    if (valuesCount(id) >= results.length || filteredValCount(id) >= 10) continue // if true, stop the loop
    // If not then keep processing the images
    await new Promise((resolve, reject) => setTimeout(resolve, 50)) // add 50ms delay for each loop
    fetchEach(results[r], r, msg.client, maps[id])
  }

  // When the all results have been fetched, get the array
  results = (await processedArr(id, results.length))
    .sort((a, b) => a[0] - b[0]) // sort by index
    .map(a => a[1]) // get the values

  // Convert each result into a MessageEmbed
  const embeds = []
  for (const p in results) {
    const result = results[p]
    if (!result || embeds.length > 10) return // limit to 10 embeds only
    // Check if image already exists in the embeds array by using the image url and hash
    const hashes = embeds.map(e => e.hash)
    const images = embeds.map(e => e.image)
    if (hashes.indexOf(result.hash) <= -1 || images.indexOf(result.image)) {
      // Make an embed
      const { channel, msgId, user, avatar, color, image, timestamp } = result
      embeds.push(new MessageEmbed()
        .setAuthor(`#${+p + 1} by ${user} (Link)`, avatar, `https://discord.com/channels/${msg.guildId}/${channel}/${msgId}`)
        .setColor(color)
        .setImage(image)
        .setTimestamp(timestamp)
        .setFooter({ text: `🔎 "${args.join(' ')}"` }))
    } else {
      // Image already exists
      imgEntry.remove(result._id) // delete entry in db
    }
  }

  // Send embeds
  msg.reply({ content: `I was able to find ${valuesCount(id)} images:`, embeds })
  // Delete instance data
  return delete maps[id]
}
