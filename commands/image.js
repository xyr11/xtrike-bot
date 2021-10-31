const { MessageEmbed } = require('discord.js')
const { prefix, getUserPerms } = require('../config')
const { ImagesModel, activateChannel, activateServer, deactivateChannel, deactivateServer, filterData } = require('../modules/getImage')
const Fuse = require('fuse.js')

exports.info = {
  name: 'image',
  category: 'Commands',
  description: 'Search for text in images',
  usage: 'image <WORDS>',
  aliases: ['bot', 'version'],
  permLevel: 'User'
}

/*
[{
  guildId: '123456',
  data: [{}, {}, {}, {}, {}],
  excludedChannels: [
    '654321',
    '101010'
  ],
  totalToday: 42
}]
*/

exports.run = async (client, message, args) => {
  // check if server has activated this command to their servers

  const guildId = message.guildId

  // get server data, if any
  // ? only fetch ONCE, when the `;image` command is used
  // const serverData = await ImagesModel.find({ guildId })
  const serverData = filterData(await ImagesModel.find({ guildId }), message.guildId)
  // if serverData has a value in it then it means that the server has activated the command
  const activated = !!serverData

  if (getUserPerms(message) < 2) {
    message.reply('You need to be a moderator or an admin to be able to do this.')
  } else {
    if (args[0] === '--activate' || args[0] === '--enable') {
      if (args[1] === 'channel') {
        if (!activated) {
          message.reply(`A moderator or admin hasn't activated this command yet. \nTo enable it, enter \`${prefix}image --activate\``)
          return
        }
        activateChannel(message)
      } else if (!args[1] || (args[1] && args[1] === 'server')) {
        if (activated) {
          message.reply('You have activated this server already!')
        } else {
          activateServer(message)
        }
        return
      }
    } else {
      if (args[0] === '--deactivate' || args[0] === '--disable') {
        if (!activated) {
          message.reply(`A moderator or admin hasn't activated this command yet. \nTo enable it, enter \`${prefix}image --activate\``)
          return
        }
        if (args[1] === 'channel') {
          deactivateChannel(message)
        } else if (!args[1] || (args[1] && args[1] === 'server')) {
          if (args[1] === 'server' && args[2] === 'YES') {
            deactivateServer(message)
            return
          } else {
            message.reply('```When you deactivate the image command, it will remove ALL data regarding sent images in this server shortly after (so if you plan to re-activate later, you cannot search for them.) \nAre you really sure about this? Please enter "image --deactivate server YES" if you\'re sure, and if not you can safely ignore this.```')
            return
          }
        }
      }
    }
  }

  // now the fun stuff
  // again, return silently if server hasn't activated the command yet
  if (!activated) return

  // get all image data
  const data = serverData.data

  if (args[0] === 'debug') {
    message.channel.send('```json\n' + JSON.stringify(data, undefined, 2) + '\n```')
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
        name: 'username',
        weight: 0.3
      },
      {
        name: 'nickname',
        weight: 0.4
      }
    ]
  })

  const result = fuse.search(args.join(' '))

  if (result.length === 0) {
    message.reply('Sorry, I wasn\'t able to find images that contains that text.')
    return
  }
  /**
  let description = ''
  for (const r in result) {
    const item = result[r].item // the only relevant part
    files.push(item.image)
    description += `[#${+r + 1} by <@${item.authorId}>](${item.url})\n`
  }
  message.reply({
    content: `I was able to find ${result.length} image${result.length > 1 ? 's' : ''}:`,
    embeds: [{
      title: 'Search results',
      description,
      footer: { text: 'Discord removed the ability to attach files in embeds so yeah' }
    }],
    files
  })
   */
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
      .setAuthor(author.tag + author.bot ? ' [Bot]' : '', author.avatarURL)
      .setDescription(`[#${+r + 1} by <@${author.id}>](${url})`)
      .setImage(image)
      .setTimestamp(when)
    )
  }
  message.reply({
    content,
    embeds
  })
}
