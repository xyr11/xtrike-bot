const Discord = require('discord.js')
const { discordTime } = require('../modules/base')

exports.info = {
  name: 'server',
  category: 'Random',
  description: 'Get all available info on this Discord server',
  usage: '`$$server`',
  aliases: ['guild'],
  permLevel: 'User'
}

// Shard status, from https://discord.js.org/#/docs/main/stable/typedef/Status
const shardStat = [
  'ready',
  'connecting',
  'reconnecting',
  'idle',
  'nearly',
  'disconnected',
  'waiting_for_guilds',
  'identifying',
  'resuming'
]

// Explicit content filter levels
// from https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level
const explicitContLvl = {
  DISABLED: 'media will not be scanned',
  MEMBERS_WITHOUT_ROLES: 'media sent by members without roles will be scanned',
  ALL_MEMBERS: 'media sent by all members will be scanned'
}

/** @param {import('../class/sendMsg')} msg */
exports.run = async msg => {
  await msg.setDefer()

  // Force fetch the guild
  const guild = await msg.client.guilds.fetch(msg.guildId)

  // Check if there is an outage (https://discord.js.org/#/docs/main/stable/class/Guild?scrollTo=memberCount)
  if (!guild.available) return msg.reply({ embeds: [{ title: 'Server Outage', description: 'I had an error in getting server data because of an outage. Please try again later.' }] })

  // Get server properties and force fetch if necessary
  const { afkChannelId, afkTimeout, me, channels, createdAt, defaultMessageNotifications, description, explicitContentFilter, features, id, memberCount, mfaLevel, name, nsfwLevel, ownerId, partnered, preferredLocale, premiumSubscriptionCount, premiumTier, presences, rulesChannelId, shard, shardId, systemChannelId, vanityURLCode, verificationLevel, verified, voiceStates } = guild
  const banner = guild.bannerURL()
  const bans = (await guild.bans.fetch()).size
  const channelCount = (await channels.fetch()).size
  const emojis = (await guild.emojis.fetch()).size
  const icon = guild.iconURL({ size: 512 })
  const splashUrl = guild.discoverySplashURL()
  const stickers = (await guild.stickers.fetch()).size
  const scheduledEvents = guild.scheduledEvents && (await guild.scheduledEvents.fetch()).size
  const systemChannelFlags = guild.systemChannelFlags.toArray()
  const threadCount = (await channels.fetchActiveThreads()).threads.size
  const welcome = await guild.fetchWelcomeScreen()
  // Get all roles and filter out roles managed by bots
  const roles = [...(await guild.roles.fetch()).values()].map(role => !role.managed ? role.toString() : '').filter(a => a)
  // Get online members count
  const online = [...presences.cache.values()].reduce((a, b) => b.status !== 'offline' ? a + 1 : a, 0)
  // Get platforms where online users are on
  const platforms = {}
  for (const a of presences.cache.values()) { const p = Object.keys(a.clientStatus)[0]; if (p) platforms[p] = (platforms[p] || 0) + 1 }
  // Get users in vc
  const inVc = [...voiceStates.cache.values()].map(v => ({ stream: v.streaming }))
  // Get users streaming in vc
  const streaming = inVc.filter(a => a.stream).length

  // Create the embed
  const embed = new Discord.MessageEmbed()
    .setTitle(name)
    .setColor(me.displayHexColor)
    .setDescription(
      (description || welcome.description ? `${description || welcome.description} \n` : '') +
      `Id: ${id} \n` +
      (verified ? 'Verified: Yes \n' : '') +
      (partnered ? 'Partnered: Yes \n' : '') +
      `${memberCount} members (${online} online${inVc.length ? `, ${inVc.length} in vc${streaming ? `, ${streaming} streaming)` : ''}` : ''}) \n` +
      (premiumSubscriptionCount ? `${premiumSubscriptionCount} boosts ${premiumTier !== 'NONE' ? `(tier ${premiumTier[5]})` : ''}` : '') +
        `Created ${discordTime(createdAt, 'R')} ` +
        `| Owned by <@${ownerId}> ` +
        (nsfwLevel === 'AGE_RESTRICTED' ? '| NSFW server' : '') +
        (vanityURLCode ? `| [discord.gg/${vanityURLCode}](https://discord.gg/${vanityURLCode})` : '') + '\n' +
      (icon ? `[Server icon](${icon})` : 'No server icon ') + (banner ? `| [Server banner](${banner})` : '') + (splashUrl ? `| [Discovery splash image](${splashUrl})` : '')
    )
    .addField('More',
      `Preferred locale: ${preferredLocale} \n` +
      `Verification level: ${verificationLevel.toLowerCase().replace('_', ' ')} \n` +
      `Default message notification level: ${defaultMessageNotifications.toLowerCase().replace('_', ' ')} \n` +
      `Shard: ${shardId} (${shardStat[shard.status]}, ${shard.ping}ms) \n` +
      `Explicit content filter: ${explicitContLvl[explicitContentFilter]} \n` +
      (mfaLevel !== 'NONE' ? `MFA Level: ${mfaLevel} \n` : '') +
      (scheduledEvents ? `Events: ${scheduledEvents} \n` : '') +
      (rulesChannelId ? `Rules channel: <#${rulesChannelId}> \n` : '') +
      `System messages channel: <#${systemChannelId}> ${
        systemChannelFlags.length
        ? `(${systemChannelFlags.join(', ').toLowerCase().replaceAll('_', ' ').replaceAll('suppress', 'no')})`
        : ''} \n` +
      (afkChannelId ? `AFK channel: <#${afkChannelId}> (${afkTimeout}s timeout) \n` : '') +
      (bans ? `Banned users: ${bans} \n` : '') +
      (welcome.enabled
        ? 'Welcome screen: Enabled \n' +
          (welcome.description ? `Welcome screen description: ${welcome.description} \n` : '') +
          (welcome.welcomeChannels?.size ? `Welcome screen channels: ${[...welcome.welcomeChannels.values()].map(c => `<#${c.channelId}>`).join(', ')} \n` : '')
        : '') +
      `Features: \`${features.length ? features.join(', ').toLowerCase() : 'none'}\` \n`)
    .addField('Numbers',
      `${memberCount} members \n` +
      `${online} people online ` + (online ? `(${Object.entries(platforms).map(a => `${a[1]} in ${a[0]}`).join(', ')})\n` : '') +
      (premiumSubscriptionCount ? `${premiumSubscriptionCount} boosts \n` : '') +
      `${emojis} emojis \n` +
      (stickers ? `${stickers} stickers \n` : '') +
      `${channelCount} channels ${threadCount ? `\n (${threadCount} active threads)` : ''} \n` +
      `${roles.length} roles`)
    .addField('Roles', roles.join(', ').length > 1020
      ? roles.join(', ').match(/.{1,1020}(?=\s)/g)[0] + '...'
      : roles.join(', '))
  // Add server icon as embed thumbnail
  if (icon) embed.setThumbnail(icon)
  // Add banner as embed image
  if (banner) embed.setImage(banner)
  // Reply
  msg.reply({ embeds: [embed] })
}
