const { Message, Interaction, MessageEmbed } = require('discord.js') // eslint-disable-line no-unused-vars
const { prefix, colors, getUserPerms, time } = require('../config')
const { ImagesModel, activateChannel, activateServer, deactivateChannel, deactivateServer, filterData } = require('../modules/getImage')
const Fuse = require('fuse.js')

exports.info = {
  name: 'image',
  category: 'Commands',
  description: 'Search for text in images. {{By default, it searches for images sent until 7 days ago and from the current channel only.}}',
  usage: '`$$image [options] <words>`\n',
  option: '`--server` to search on all channels\n' +
  '`--all` to search images regardless of how old it is\n' +
  '`--deactivate <channel|server>`\n' +
  '`--activate <channel|server>`',
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
      name: '--deactivate',
      description: 'Deactivate the command in the current server or channel',
      choices: [
        {
          name: 'server',
          value: 'Deactivate the command for the whole server. WILL REMOVE ALL DATA.'
        },
        {
          name: 'channel',
          value: 'Stop searching for images in the current channel'
        }
      ]
    },
    {
      type: 3,
      name: '--activate',
      description: 'Activate the command in the current server or channel',
      choices: [
        {
          name: 'channel',
          value: 'Enable searching for images in the current channel'
        },
        {
          name: 'server',
          value: 'Enable the command for the whole server'
        }
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
  const { channelId, guildId } = message

  // get server data, if any
  const serverData = filterData(await ImagesModel.find({ guildId }), message.guildId)
  // if serverData has a value in it then it means that server has activated the command
  const activated = !!serverData

  // get list of excluded channels
  let excludedChannels = []
  if (activated) excludedChannels = serverData.excludedChannels
  // check if current channel is excluded
  const excluded = excludedChannels.indexOf(channelId) > -1

  // activating/deactivating the command
  if (getUserPerms(message) < 2) { // check user permission level
    message.reply('You need to be a moderator or have a higher role to be able to do this.')
  } else {
    if (['--activate', '--enable', '--include'].indexOf(args[0]) > -1) {
      if (args[1] === 'channel') {
        if (!activated) {
          message.reply(`A moderator or admin hasn't activated this command yet. \nTo enable it, enter \`${prefix}image --activate\``)
        } else {
          if (!excluded) {
            message.reply(`This channel is already activated. By default, all channels are activated. \nTo deactivate a channel, try \`${prefix}image --deactivate channel\`.`)
          } else {
            await activateChannel(guildId, channelId, excludedChannels)
            message.reply('Successfully included this channel for image monitoring.')
          }
        }
      } else if (!args[1] || (args[1] && args[1] === 'server')) {
        if (activated) {
          message.reply('You have activated this server already!')
        } else {
          await activateServer(message)
          message.reply({
            content: 'Success!',
            embeds: [{
              color: colors.green,
              description: `:green_circle: Successfully activated the \`${prefix}image\` command for this server`,
              footer: { text: 'Now send those images!' }
            }]
          })
        }
      }
      return
    } else if (['--deactivate', '--disable', '--exclude'].indexOf(args[0]) > -1) {
      if (!activated) {
        message.reply(`A moderator or admin hasn't activated this command yet. \nTo enable it, enter \`${prefix}image --activate\``)
        return
      }
      if (args[1] === 'channel') {
        if (excluded) {
          message.reply('This channel is already excluded!')
        } else {
          await deactivateChannel(guildId, channelId, excludedChannels)
          message.reply('Successfully excluded this channel for image monitoring.')
        }
      } else if (!args[1] || (args[1] && args[1] === 'server')) {
        if (args[1] === 'server' && args[2] === 'YES') {
          await deactivateServer(guildId)
          message.reply('Successfully deactivated this command!')
        } else {
          message.reply('```When you deactivate the image command, it will remove ALL data regarding sent images in this server shortly after (so if you plan to re-activate later, you cannot search for them.) \nAre you really sure about this? Please enter "image --deactivate server YES" if you\'re sure, and if not you can safely ignore this.```')
        }
      }
      return
    }
  }

  // return silently if server hasn't activated the command yet
  if (!activated || excluded) return

  // get image data from collection entry
  let data = serverData.data

  // ? deprecated
  if (args.indexOf('--here') > -1) {
    args.splice(args.indexOf('--here'), 1) // remove --here
  }

  // by default, this command will only check for images in the current channel
  if (args.indexOf('--server') === -1) {
    data = data.filter(obj => obj.channel === channelId)
  } else {
    // if user wants to search the whole server
    args.splice(args.indexOf('--server'), 1) // remove the --server part
  }

  // by default, this command will only check for images sent 7 days or earlier
  if (args.indexOf('--all') === -1) {
    data = data.filter(obj => obj.when >= (Date.now() - 3600000 * 24 * 7))
  } else {
    // if user wants to check all images regardless of how old it is
    args.splice(args.indexOf('--all'), 1) // remove the --all part
  }

  // Fuse.js search options
  const fuse = new Fuse(data, {
    // isCaseSensitive: false,
    // includeScore: false,
    // shouldSort: true,
    // includeMatches: false,
    minMatchCharLength: 2,
    // findAllMatches: false,
    // location: 0,
    threshold: 0.7,
    // distance: 100,
    ignoreLocation: true,
    ignoreFieldNorm: true,
    keys: ['text']
  })

  // do magic (fuzzy search)
  const result = fuse.search(args.join(' '))

  // check if there are any results
  if (result.length === 0) {
    message.reply('Sorry, I wasn\'t able to find images that contains that text.')
    return
  }

  // cut the results to 10
  result.splice(10, result.length - 9)

  const embeds = []
  for (const r in result) {
    // results
    const { url, channel, id, image, author, when } = result[r].item
    // embed
    embeds.push(new MessageEmbed()
      .setColor(author.hexAccentColor)
      .setAuthor(`#${+r + 1} by ${author.tag} (Link)`, author.avatarURL ?? `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.webp`, url ?? `https://discord.com/channels/${guildId}/${channel}/${id}`)
      .setImage(image)
      .setFooter(`⌚ ${time(when)} • 🔍 "${args.join(' ')}" on ${time()}`)
    )
  }
  message.reply({ content: `I was able to find ${result.length} image${result.length > 1 ? 's' : ''}:`, embeds })
}
