const { Message, Interaction, MessageEmbed, Client } = require('discord.js') // eslint-disable-line no-unused-vars
const getPixels = require('get-pixels')
const { prefix, colors, userPerms } = require('../modules/base')
const { ImagesModel, activateChannel, activateServer, deactivateChannel, deactivateServer, fetchImageUrl, updatePreV020, guildIdentifiers, deleteEntry, getEntry, awaitImgHash, updateEntry } = require('../modules/getImage')
const Fuse = require('fuse.js')

exports.info = {
  name: 'image',
  category: 'Commands',
  description: 'Search for text in images. {{By default, it searches for images sent until 8 months ago and from the current channel only.}}',
  usage: '`$$image [options] <words>`\n',
  option: '`--server` to include images on other channels\n' +
    '`--all` to include images sent 8+ months ago\n' +
    '`--disable <channel|server>`\n' +
    '`--enable <channel|server>`',
  isBeta: true,
  aliases: ['images'],
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
        { name: 'server', value: 'Disable the command for the whole server and remove all data' },
        { name: 'channel', value: 'Stop searching for images in the current channel' }
      ]
    },
    {
      type: 3,
      name: '--enable',
      description: 'Enable the command in the current server or channel',
      choices: [
        { name: 'channel', value: 'Enable searching for images in the current channel' },
        { name: 'server', value: 'Enable the command for the whole server' }
      ]
    }
  ]
}

// an object that stores a map of processed results for every instance of the ;image command
/** @type {Map<String, Object|undefined>[]} */
const maps = {}

/**
 * Check the number of results in the processedResults Map.
 *
 * @example
 * [0: 'bar', 1: 'foo', 2: 'baz'] => 3
 * [0: undefined, 1: 'baz'] => 1
 * [0: 'foo', 1: 'bar', 3: 'baz'] => undefined
 *
 * @param {String} instance the instance of the map in the object
 * @returns {undefined|Number}
 */
const valuesCount = instance => {
  const map = maps[instance]
  if (!map) return
  let count = 0
  for (let i of map.keys()) {
    i = +i // convert to number because index is a string
    // check if previous index exists
    if (i === 0 || map.has(i - 1 + '')) {
      // check if current index is not undefined
      if (map.get(i + '')) count++
    } else return // if previous index doesnt exists, it means that there's a skipped index
  }
  // return how many values are not undefined
  return count
}

/**
 * Transform the `get-pixels` module to a Promise
 * @param {String|Uint8Array} input getPixels input, can be a link or a buffer
 * @param {String=} type mime type, required for buffer
 * @returns {Promise<[Array, Array, Array, Array]>}
 */
const awaitGetPxl = (input, type) =>
  new Promise((resolve, reject) => getPixels(input, type, (err, data) => err ? reject(err) : resolve(data)))

/**
 * Get the most "popular" color
 * @param {Uint8Array[]} bufferData Uint8Array array of buffer data
 * @returns {Number[]} RGB values. 1st value is red, 2nd is green, 3rd is blue
 */
const popularColor = bufferData => {
  // size of the array (each pixel occupies 4 values)
  const size = bufferData.length
  // map to store colors
  const rgbMap = new Map()

  // get the "popularity" of colors by using rgb values
  let i = -4 // the "cursor" for the buffer data
  const blockSize = Math.ceil((size / 4) / 15000) // only visit every x pixels
  const nearestClr = num => Math.round(num / 30) * 30 < 255 ? Math.round(num / 30) * 30 : 255 // round to nearest 30
  while ((i += blockSize * 4) < size) {
    const pxl = [nearestClr(bufferData[i]), nearestClr(bufferData[i + 1]), nearestClr(bufferData[i + 2])].toString()
    rgbMap.set(pxl, (rgbMap.get(pxl) || 0) + 1)
  }

  // sort the map from the most "popular" color
  const rgb = [...rgbMap].sort((a, b) => b[1] - a[1])
  const parse = str => JSON.parse(`[${str.split(',')}]`) // convert string to array
  if (
    rgb.length > 2 && // check if there are more than 2 entries
    ['0,0,0', '30,30,30', '240,240,240', '255,255,255'].indexOf(rgb[0][0]) > -1 && // check if most popular color is white/black
    rgb[0][1] * 0.3 < rgb[1][1] // check if the next value is at least 30% as popular as the most popular color
  ) {
    return parse(rgb[1][0]) // return the 2nd most popular color
  } else {
    return parse(rgb[0][0]) // return the most popular color
  }
}

/**
 * Process each image asynchronously and place results in `processedResults`
 * @param {String} instance the instance of the map in the object
 * @param {Object} data Data from database
 * @param {Number} index index of data for ranking
 * @param {Message|Interaction} thing
 */
const processEachImage = async (instance, data, index, thing) => {
  // check if there are enough values for output
  if (valuesCount(instance) >= 10) return

  // get data
  const { item } = data
  const { _id, c: channel, a: author, i: imageUrl, w: timestamp } = item
  const msgId = _id.match(/[0-9]{17,20}/)[0] // get the message id from _id
  const map = maps[instance]

  // fetch image
  const { ok, buffer, type } = await fetchImageUrl(imageUrl, thing.client)
  // check if image is deleted
  if (!ok) {
    map.set(index, undefined) // set to undefined
    return deleteEntry(_id) // delete entry
  }

  // get hash
  const hash = item.h || await awaitImgHash({ data: buffer, ext: type })
  if (!item.h) updateEntry({ _id, h: hash }) // add hash to db if there isnt one yet

  // get the most popular color in image
  const pixels = await awaitGetPxl(buffer, type) // get pixels
  const color = popularColor(pixels.data)

  // fetch user data
  const user = await thing.client.users.cache.get(author).fetch()

  // add values
  map.set(index, new MessageEmbed()
    .setAuthor(`#${+index + 1} by ${user.tag} (Link)`, user.avatarURL(), `https://discord.com/channels/${thing.guildId}/${channel}/${msgId}`)
    .setColor(color)
    .setImage(imageUrl)
    .setTimestamp((timestamp + 1635638400) * 1000)
    .setFooter(hash + '|' + _id)) // metadata, will be deleted later
}

/**
 * @param {Message} message
 * @param {Interaction} interaction
 * @param {Array} args
 */
exports.run = async (message, interaction, args) => {
  const thing = message || interaction
  const { id, channelId, guildId } = thing

  // defer reply
  if (interaction) await interaction.deferReply({ ephemeral: true })

  // set the instance of the map
  maps[id] = new Map()
  const map = maps[id]

  // Hello there! Please look at guides/fetchImage.md to know more about the
  // specifications of the `;image` command. Thank you!

  // backward compatibility for pre-v0.2.0 entries
  await updatePreV020()

  // get server data
  const configEntry = await getEntry({ f: true, g: guildId })

  // get list of excluded channels
  const excludedChannels = configEntry ? configEntry.d.e : []
  // check if current channel is excluded
  const isExcluded = excludedChannels.indexOf(channelId) > -1

  // ! rewrite
  // command config
  if (userPerms(thing) < 2) { // check user permission level
    thing.reply('You need to be a moderator or have a higher role to be able to do this.')
  } else {
    if (['--activate', '--enable'].indexOf(args[0]) > -1) {
      if (args[1] === 'channel') {
        if (!configEntry) {
          thing.reply(`A moderator or admin hasn't enabled this command yet. \nTo enable it, enter \`${prefix}image --enable\``)
        } else {
          if (!isExcluded) {
            thing.reply(`This channel is already enabled. By default, all channels are enabled. \nTo disable a channel, try \`${prefix}image --disable channel\`.`)
          } else {
            await activateChannel(configEntry, channelId)
            thing.reply('Successfully included this channel for image monitoring.')
          }
        }
      } else if (!args[1] || (args[1] && args[1] === 'server')) {
        if (configEntry) {
          thing.reply('You have enabled this server already!')
        } else {
          await activateServer(thing)
          thing.reply({
            content: 'Success!',
            embeds: [{
              color: colors.green,
              description: `:green_circle: Successfully enabled the \`${prefix}image\` command for this server`
            }]
          })
        }
      }
      return
    } else if (['--deactivate', '--disable'].indexOf(args[0]) > -1) {
      if (!configEntry) {
        thing.reply(`A moderator or admin hasn't enabled this command yet. \nTo enable it, enter \`${prefix}image --enable\``)
        return
      }
      if (args[1] === 'channel') {
        if (isExcluded) {
          thing.reply('This channel is already excluded!')
        } else {
          await deactivateChannel(configEntry, channelId)
          thing.reply('Successfully excluded this channel for image monitoring.')
        }
      } else if (!args[1] || (args[1] && args[1] === 'server')) {
        if (args[1] === 'server' && args[2] === 'YES') {
          await deactivateServer(guildId)
          thing.reply('Successfully disabled this command!')
        } else {
          thing.reply('```When you disabled the image command, it will remove ALL data regarding sent images in this server shortly after (so if you plan to reenable later, you cannot search for them.) \nAre you really sure about this? Please enter "image --disable server YES" if you\'re sure, and if not you can safely ignore this.```')
        }
      }
      return
    }
  }

  // return silently if server hasn't activated the command yet
  if (!configEntry || isExcluded) return

  // get image data from collection entry
  let data

  // Check if the given option is present in `args`
  const option = option => args.indexOf(option) > -1 && args.indexOf(option)

  if (option('--server')) {
    // search for images in the whole server
    args.splice(option('--server'), 1) // remove `--server`
    data = await ImagesModel.find({ g: guildIdentifiers().get(guildId) }, '-f -g')
  } else {
    // search for images in the current channel only (default)
    data = await ImagesModel.find({ c: channelId }, '-f -g')
  }

  // ? `--here`: search for images in the current channel (deprecated because it's already the default)
  if (option('--here')) args.splice(option('--here'), 1) // remove `--here`

  // `--all`: search for images regardless of how old it is
  if (option('--all')) {
    args.splice(option('--all'), 1) // remove `--all`
  } else {
    // filter images sent 32 weeks (~8 months) or earlier (default)
    // 32 weeks in unix time is 1000*60*60*24*7*32 = 19353600000
    data = data.filter(obj => obj.w >= (Date.now() - 19353600000) / 1000 - 1635638400)
  }

  // search text
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
  /** @type {[Object]} */
  const results = fuse.search(args.join(' '))

  // check if there are any results
  if (!results.length) {
    return thing.reply({ content: 'Sorry, I wasn\'t able to find images that contain that text.', ephemeral: true })
  }

  // compile results
  const maxResults = results.length < 10 ? results.length : 10
  for (const index in results) {
    // stop if there are 10 results already
    if (valuesCount(id) >= maxResults) continue
    // delay the execution by 50 milliseconds for each async function
    await new Promise((resolve, reject) => setTimeout(resolve, 50))
    // async process each image
    processEachImage(id, results[index], index, thing)
  }
  /** @type {MessageEmbed[]} */
  let processed
  while (!processed) {
    await new Promise((resolve, reject) => setTimeout(resolve, 50)) // add 50ms delay
    if (valuesCount(id) >= maxResults) {
      processed = [...map] // convert the map into an array
        .sort((a, b) => a[0] - b[0]) // sort by index
        .map(a => a[1]) // get the embed objects
        .filter(a => a) // remove 'undefined' values
    }
  }
  const embeds = []
  // check and place every value on `processed` to `embeds`
  for (const embed of processed) {
    // values on embeds that are already stored
    const footers = embeds.map(e => e.footer.text) // metadata
    const hashes = footers.map(f => f.split('|')[0])

    // check if there are duplicated hashes
    const embedHash = embed.footer.text.split('|')[0]
    if (hashes.indexOf(embedHash) <= -1) {
      // hash is unique
      embeds.push(embed) // add to array
    } else {
      // hash is not unique
      const embedId = embed.footer.text.split('|')[1]
      // delete entry
      deleteEntry(embedId)
    }
  }
  // remove metadata and replace footer with search term
  embeds.forEach(embed => { embed.footer.text = `🔎 "${args.join(' ')}"` })
  // send embeds
  if (message) message.reply({ content: `I was able to find ${valuesCount(id)} images:`, embeds })
  else interaction.editReply({ content: `I was able to find ${valuesCount(id)} images:`, embeds })
  // delete instance data
  return delete processed[id]
}
