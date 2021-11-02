const { MessageEmbed } = require('discord.js')
const { prefix, colors, getUserPerms, time } = require('../config')
const { ImagesModel, activateChannel, activateServer, deactivateChannel, deactivateServer, filterData } = require('../modules/getImage')
const Fuse = require('fuse.js')

exports.info = {
  name: 'image',
  category: 'Commands',
  description: 'Search for text in images',
  usage: '`image <words>`\n' +
    '`image --here <words>` to search on current channel only\n' +
    '`image --deactivate <channel|server>`\n' +
    '`image --activate <channel|server>`',
  aliases: ['bot', 'version'],
  permLevel: 'User'
}

exports.run = async (client, message, args) => {
  // check if server has activated this command to their servers

  const { channelId, guildId } = message

  // get server data, if any
  // ? only fetch ONCE, when the `;image` command is used
  // const serverData = await ImagesModel.find({ guildId })
  const serverData = filterData(await ImagesModel.find({ guildId }), message.guildId)
  // if serverData has a value in it then it means that the server has activated the command
  const activated = !!serverData

  let excludedChannels = []
  if (activated) excludedChannels = serverData.excludedChannels
  const excluded = excludedChannels.indexOf(channelId) > -1

  if (getUserPerms(message) < 2) {
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

  // ? now the fun stuff

  // get all image data
  let data = serverData.data

  // debug
  if (args[0] === 'debug' && getUserPerms(message) >= 4) {
    message.reply('```json\n' + JSON.stringify(data, undefined, 2) + '\n```')
    return
  }

  // return silently if server hasn't activated the command yet
  if (!activated || excluded) return

  // if user wants to search on the current channel only
  if (args[0] === '--here') {
    args.shift() // remove the --here part
    data = data.filter(obj => obj.channel === channelId) // remove all entries that aren't from the same channel
  }

  // if there are no arguments passed
  if (args.length === 0) {
    message.reply('You need to give me words to search images on.')
    return
  }

  const fuse = new Fuse(data, {
    isCaseSensitive: false,
    includeScore: false,
    shouldSort: true,
    // includeMatches: false,
    // findAllMatches: false,
    minMatchCharLength: 2,
    // location: 0,
    threshold: 0.75,
    distance: 100,
    // useExtendedSearch: false,
    // ignoreLocation: false,
    ignoreFieldNorm: false,
    keys: [
      'text',
      {
        name: 'author.username',
        weight: 0.3
      }
    ]
  })

  const result = fuse.search(args.join(' '))

  if (result.length === 0) {
    message.reply('Sorry, I wasn\'t able to find images that contains that text.')
    return
  }

  const embeds = []
  let content = `I was able to find ${result.length} image${result.length > 1 ? 's' : ''}:`
  for (const r in result) {
    // results
    const { url, image, author, when } = result[r].item
    // add link in content
    content += `\n#${+r + 1} by ${author.tag}: ${url}`
    // embed
    embeds.push(new MessageEmbed()
      .setColor(author.hexAccentColor)
      .setAuthor(`#${+r + 1} by ` + author.tag + (author.bot ? ' [Bot]' : ''), author.avatarURL, url)
      .setImage(image)
      .setFooter(`⏲ ${time(when)} • 🔍 "${args.join(' ')}" on ${time()}`)
    )
  }
  message.reply({
    content,
    embeds
  })
}
