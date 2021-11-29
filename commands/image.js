const { Message, Interaction, MessageEmbed } = require('discord.js') // eslint-disable-line no-unused-vars
const { prefix, colors, userPerms } = require('../config')
const { ImagesModel, getImageDb, activateChannel, activateServer, deactivateChannel, deactivateServer, updatePreV020, guildIdentifiers } = require('../modules/getImage')
const Fuse = require('fuse.js')

exports.info = {
  name: 'image',
  category: 'Commands',
  description: 'Search for text in images. {{By default, it searches for images sent until 7 days ago and from the current channel only.}}',
  usage: '`$$image [options] <words>`\n',
  option: '`--server` to search on all channels\n' +
    '`--all` to search images regardless of how old it is\n' +
    '`--disable <channel|server>`\n' +
    '`--enable <channel|server>`',
  isBeta: true,
  aliases: ['images'],
  permLevel: 'User',
  requiredArgs: true,
  options: [
    {
      type: 3,
      name: 'words',
      description: 'The words to search'
    },
    {
      type: 5,
      name: '--server',
      description: 'Search on all channels',
      choices: []
    },
    {
      type: 5,
      name: '--all',
      description: 'Search images regardless of how old it is',
      choices: []
    },
    {
      type: 3,
      name: '--disable',
      description: 'Disable the command in the current server or channel',
      choices: [
        { name: 'server', value: 'Disable the command for the whole server. WILL REMOVE ALL DATA.' },
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

/**
 * @param {Message} message
 * @param {Interaction} interaction
 * @param {Array} args
 */
exports.run = async (message, interaction, args) => {
  const thing = message || interaction
  const { channelId, guildId } = thing

  // Hello there! Please look at guides/fetchImage.md to know more about the
  // specifications of the `;image` command. Thank you!

  // backward compatibility for pre-v0.2.0 entries
  await updatePreV020()

  // get server data
  const configEntry = await getImageDb({ f: true, g: guildId })

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
  const guildIdentifier = guildIdentifiers().get(guildId)
  let data = await ImagesModel.find({ g: guildIdentifier }, '-f -g')

  /**
   * Check if the given option is present in `args`
   * @param {String} option
   */
  const hasOption = option => args.indexOf(option) > -1

  // ? `--here`: search for images in the current channel (deprecated because it's already the default)
  if (hasOption('--here')) {
    args.splice(args.indexOf('--here'), 1) // remove `--here`
  }

  // `--server`: search for images in the whole server
  if (hasOption('--server')) {
    args.splice(args.indexOf('--server'), 1) // remove `--server`
  } else {
    // search for images in the current channel only (default)
    data = data.filter(obj => obj.c === channelId)
  }

  // `--all`: search for images regardless of how old it is
  if (hasOption('--all')) {
    args.splice(args.indexOf('--all'), 1) // remove `--all`
  } else {
    // search for images sent 7 days (604800000 ms) or earlier (default)
    data = data.filter(obj => obj.w >= (Date.now() - 604800000) / 1000 - 1635638400)
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
  const result = fuse.search(args.join(' '))

  // check if there are any results
  if (!result.length) return thing.reply('Sorry, I wasn\'t able to find images that contains that text.')
  // cut the results to 10
  result.splice(10, result.length - 9)
  // send the results
  const embeds = []
  for (const r in result) {
    // results
    const item = result[r].item
    const { _id: id, c: channel, a: author, i: image, w: timestamp } = item
    // fetch user data
    const user = await thing.client.users.cache.get(author).fetch()
    // create embed
    embeds.push(new MessageEmbed()
      .setAuthor(`#${+r + 1} by ${user.tag} (Link)`, user.avatarURL(), `https://discord.com/channels/${guildId}/${channel}/${id}`)
      .setColor(user.hexAccentColor)
      .setImage(image)
      .setFooter(`🔍 "${args.join(' ')}"`)
      .setTimestamp((timestamp + 1635638400) * 1000)
    )
  }
  thing.reply({ content: `I was able to find ${result.length} images:`, embeds })
}
