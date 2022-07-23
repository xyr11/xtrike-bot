const Discord = require('discord.js')
const BotCmd = require('../class/botCmd')

/** @param {String} str */
const capitalize = str => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : null

// Prepositions to use in presence activities
const prep = { PLAYING: '', STREAMING: '', LISTENING: 'to', WATCHING: '', COMPETING: 'in' }

/**
 * Generate a random integer from 0 to x-1
 * @param {Number} int
 */
const rand = int => Math.floor(Math.random() * int)

module.exports = new BotCmd('user')
  .setCategory('General')
  .setDescription('Get all available info on a Discord user')
  .setUsage('`$$user [user @ / user id / username]`')
  .setAliases(['users', 'me', 'member', 'members'])
  .requiredPerm('User')
  .applicationOptions([{ type: 6, name: 'user', description: 'User to get info' }])
  .callback(async (msg, args) => {
    const { prefix, discordTime } = require('../modules/base')

    await msg.setDefer()
    let { guild, text } = msg

    // If there's no given args
    if (!text) text = msg.author.id

    // Variable that stores GuildMembers
    /** @type {Map<Discord.Snowflake, Discord.GuildMember>} */
    const givenMembers = new Map()

    // Search user tags and user ids
    const tags = text.match(/((?<=(?<!<)(\s|^)(@|(?!@|<|([0-9]{17,21}))))((?!#[0-9]{4}(\s|$)).)+#[0-9]{4})/g)
    const ids = text.match(/([0-9]{17,21})/g)
    if (tags || ids) {
      // Get the user tag (@name#0000 or name#0000)
      if (tags) {
        // Get all tags in the guild and set the values as their user ids
        const members = [...(guild.members.cache).values()]
        // Get user id from tags object
        for (const tag of tags) {
          let member = members.find(member => member.user.tag === tag)
          // Check if no member is found or if the member is already recorded
          if (!member || givenMembers.has(member.user.tag)) continue
          // Fetch user
          member = await member.fetch()
          givenMembers.set(member.user.tag, member)
        }
      }
      // Get the user ids snowflake (<@12345678> or 12345678)
      if (ids) {
        for (const id of ids) {
          let member = await guild.members.cache.get(id)
          // Check if no member is found or if the member is already recorded
          if (!member || givenMembers.has(member.user.tag)) continue
          // Fetch user
          member = await member.fetch()
          givenMembers.set(member.user.id, member)
        }
      }
    } else {
      // Search for the user name
      let member = await guild.members.search({ query: text })
      // Check if no member is found or if the member is already recorded
      if (member && !givenMembers.has([...member.values()][0].user.id)) {
        member = await member.fetch()
        const id = [...member.values()][0].user.id
        givenMembers.set(id, await [...member.values()][0].fetch())
      }
    }

    // If there are no users found
    if (givenMembers.size < 1) return msg.reply("I didn't find any user with that name or tag.")

    // For each given users
    for (const member of givenMembers.values()) {
      // Get User of given user
      const user = member.user
      // Get user properties
      const { tag, username, id, bot, createdAt, banner, hexAccentColor, flags } = user
      const { communicationDisabledUntil, displayHexColor, nickname, pending, joinedAt, premiumSince, presence, roles, voice } = member
      const { mute, serverMute, deaf, serverDeaf, streaming, requestToSpeakTimestamp, suppress, channel: vc } = voice
      const { activities, clientStatus, status } = presence || {}
      let customAct, acts
      if (activities) {
        // Get custom activity
        customAct = activities.filter(a => a.type === 'CUSTOM')
        // Get non-custom activities
        acts = activities.filter(a => a.type !== 'CUSTOM').map(act => `${capitalize(act.type)} ${prep[act.type]} ${(act.url ? `[${act.name}](${act.url})` : act.name)}${act.details ? `: ${act.details}` : ''}${act.state ? ` — ${act.state}` : ''} (since ${discordTime(act.createdTimestamp, 'R')})`)
      }

      // Custom activity
      let customActDisplay = ''
      if (customAct && customAct.length) {
        // Check if there is an emoji
        if (customAct[0].emoji) customActDisplay += customAct[0].emoji.toString() + ' '
        // Check if there is an activity state (the text in the activity)
        if (customAct[0].state) customActDisplay += customAct[0].state
      }

      // Create the embed
      const embed = new Discord.MessageEmbed()
        .setTitle(tag)
        .setThumbnail(user.displayAvatarURL({ size: 512 }))
        .setColor(displayHexColor)
        .setDescription(
          (customActDisplay ? customActDisplay + ' \n' : '') +
          `Username: **${username}** (${user.toString()}) \n` +
          (nickname ? `Nickname: ${nickname} \n` : '') +
          `Id: ${id} \n` +
          (pending ? 'Pending: **Yes** \n' : '') +
          (bot
            ? (rand(4) === 3 ? 'Sentient: Prob—I mean ' : '') + 'Bot: Yes ' +
              (rand(6) === 2 ? '[𓄿](http://crom. "01101000 01101001")' : '') + '\n' // an easter egg? (http://scp-wiki.net/command-query-separation)
            : '') +
          (communicationDisabledUntil ? `**Currently in timeout** (will end ${discordTime(communicationDisabledUntil, 'R')}) \n` : '') +
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
        .addField('Presence',
          `${capitalize(status) || 'Offline'} ${(clientStatus && status !== 'offline' ? `in ${Object.keys(clientStatus)[0]} app` : '')} \n` +
          (acts && acts.length ? `${acts.join('\n')}` : ''))
      // Add banner as embed image
      if (banner) embed.setImage(banner)
      // Add user flags
      if (flags.toArray().length) embed.addField('Flags', `\`${flags.toArray().join(', ').toLowerCase()}\``)
      // Add user perms in channel
      const permissions = member.permissionsIn(msg.channelId)
      embed.addField('Permissions (in channel)', `\`${permissions.has('ADMINISTRATOR') ? 'all (administrator)' : permissions.toArray().join(', ').toLowerCase()}\``)
      // Add footer text if user is the bot
      if (id === msg.client.user.id) {
        embed.setFooter({ text: rand(3) !== 1 ? `enter ${prefix}info for more info about the bot!` : "look mom, that's me! :)" })
      }
      // Reply
      msg.reply({ embeds: [embed] })
    }
  })
