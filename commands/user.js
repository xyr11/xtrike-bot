const Discord = require('discord.js')
const { prefix, discordTime } = require('../modules/base')

exports.info = {
  name: 'user',
  category: 'Miscellaneous',
  description: 'Get info about a Discord user',
  usage: '`$$user [user @ / user id / username]`',
  aliases: ['users', 'me', 'member', 'members'],
  permLevel: 'User',
  options: [{ type: 6, name: 'user', description: 'User to get info' }]
}

/**
 * Generate a random integer from 0 to x-1
 * @param {Number} int
 */
const rand = int => Math.floor(Math.random() * int)

/**
 * @param {import('../modules/sendMsg')} msg
 * @param {String[]} args
 */
exports.run = async (msg, args) => {
  await msg.setDefer()
  const { guild } = msg

  // get the content of the message
  // remove the prefix and extra spaces before and after the content
  let content = msg.content.replace(/\s*(;|\/) *\w+/, '').replace(/^ *| *$/g, '')

  // if there's no given args
  if (!content) content = msg.author.id

  // variable that stores GuildMembers
  /** @type {Map<Discord.Snowflake, Discord.GuildMember>} */
  const givenMembers = new Map()

  // search user tags and user ids
  const tags = content.match(/((?<=(?<!<)(\s|^)(@|(?!@|<|([0-9]{17,21}))))((?!#[0-9]{4}(\s|$)).)+#[0-9]{4})/g)
  const ids = content.match(/([0-9]{17,21})/g)
  if (tags || ids) {
    // get the user tag (@name#0000 or name#0000)
    if (tags) {
      // get all tags in the guild and set the values as their user ids
      const members = [...(guild.members.cache).values()]
      // get user id from tags object
      for (const tag of tags) {
        let member = members.find(member => member.user.tag === tag)
        // check if no member is found or if the member is already recorded
        if (!member || givenMembers.has(member.user.tag)) continue
        // fetch user
        member = await member.fetch()
        givenMembers.set(member.user.tag, member)
      }
    }
    // get the user ids snowflake (<@12345678> or 12345678)
    if (ids) {
      for (const id of ids) {
        let member = await guild.members.cache.get(id)
        // check if no member is found or if the member is already recorded
        if (!member || givenMembers.has(member.user.tag)) continue
        // fetch user
        member = await member.fetch()
        givenMembers.set(member.user.id, member)
      }
    }
  } else {
    // search for the user name
    let member = await guild.members.search({ query: content })
    // check if no member is found or if the member is already recorded
    if (member && !givenMembers.has([...member.values()][0].user.id)) {
      member = await member.fetch()
      const id = [...member.values()][0].user.id
      givenMembers.set(id, await [...member.values()][0].fetch())
    }
  }

  // if there are no users found
  if (givenMembers.size < 1) return msg.reply("I didn't find any user with that name or tag.")

  // for each given users
  for (const member of givenMembers.values()) {
    // get User of given user
    const user = member.user
    // get these variables from the objects
    const { tag, username, id, bot, createdAt, banner, hexAccentColor, flags } = user
    const { displayHexColor, nickname, pending, joinedAt, premiumSince, roles, voice } = member
    const { mute, serverMute, deaf, serverDeaf, streaming, requestToSpeakTimestamp, suppress, channel: vc } = voice

    const embed = new Discord.MessageEmbed().setTitle(tag)
      .setThumbnail(user.displayAvatarURL({ size: 512 }))
      .setColor(displayHexColor)
      .setDescription(
        `Username: **${username}** (${user.toString()}) \n` +
        (nickname ? `Nickname: **${nickname}** \n` : '') +
        `Id: ${id} \n` +
        (pending ? 'Pending: **Yes** \n' : '') +
        (bot
          ? (rand(4) === 3 ? 'Sentient: Prob–I mean ' : '') + 'Bot: Yes ' +
            (rand(6) === 2 ? '[𓄿](http://crom. "01101000 01101001")' : '') + '\n' // an easter egg? (http://scp-wiki.net/command-query-separation)
          : '') +
        `Created ${discordTime(createdAt, 'R')} \n` +
        `Joined ${discordTime(joinedAt, 'R')} \n` +
        (premiumSince ? `Premium since ${discordTime(premiumSince, 'R')} \n` : '') +
        (hexAccentColor ? `Accent color: ${hexAccentColor} \n` : '') +
        `[Avatar](${user.displayAvatarURL()}) ` +
        (user.displayAvatarURL() !== user.defaultAvatarURL ? `| [Default avatar](${user.defaultAvatarURL}) ` : '') +
        (banner ? `| [Banner](${banner})` : ''))
      .addField('Server',
        `Main role: ${roles.hoist} \n` +
        `Roles: ${member._roles.map(v => `<@&${v}>`).join(', ')} \n`, true)
      .addField('Voice',
        !vc
          ? 'Not in any vc in server'
          : `Connected in ${vc.toString()} \n` +
            (mute ? `Muted: Yes ${serverMute ? '(Server muted)' : ''} \n` : '') +
            (deaf ? `Deafened: Yes ${serverDeaf ? '(Server deafened)' : ''} \n` : '') +
            (streaming ? 'Streaming: Yes \n' : '') +
            (requestToSpeakTimestamp ? `Requested to speak: Yes (${discordTime(requestToSpeakTimestamp, 'R')}) \n` : '') +
            (suppress ? 'Suppressed: Yes (in stage channel)' : ''), true)
    // add banner as embed image
    if (banner) embed.setImage(banner)
    // add user flags
    if (flags.toArray().length) embed.addField('Flags', `\`${flags.toArray().join(', ').toLowerCase()}\``)
    // add user perms in channel
    const permissions = member.permissionsIn(msg.channelId)
    embed.addField('Permissions (in channel)', `\`${permissions.has('ADMINISTRATOR') ? 'all (administrator)' : permissions.toArray().join(', ').toLowerCase()}\``)
    // add footer text if user is the bot
    if (id === msg.client.user.id) embed.setFooter(rand(3) !== 1 ? `enter ${prefix}info for more info about the bot!` : "look mom, that's me! :)")
    msg.reply({ embeds: [embed] })
  }
}
