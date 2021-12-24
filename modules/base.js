const { Intents, Permissions } = require('discord.js')
let { prefix, botName, botDescription, botColor, infoFields, status, actType, actName } = require('../config')
const { logUrgent } = require('./logger')

/** Bot intents */
const intents = [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_VOICE_STATES,
  Intents.FLAGS.GUILD_PRESENCES,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS
]
/** Bot partials (https://discordjs.guide/popular-topics/partials.html) */
const partials = ['MESSAGE', 'REACTION', 'USER']

// bot name
botName = botName || 'Xtrike Bot'
// bot description
botDescription = botDescription || 'Xtrike Bot is a multi-purpose bot.'
// info fields
if (typeof infoFields !== 'object') infoFields = {}
// bot color
botColor = botColor || '#E3E5E8'
// bot prefix
prefix = prefix || ';'

// User ids of various important people
/** Bot developer user ids */
const devs = ['681766482304434187']
/** Bot support user ids */
const botSupport = []

/** Bot presence based on env variables */
const presence = {
  status: status ?? 'online',
  activityType: actType ?? 'playing',
  activity: actName ?? ';info'
}

/** Common color codes in hex */
const colors = {
  /** Xtrike blue */
  main: '#77e4ff',
  red: '#F04848',
  green: '#2ecc71'
}

/**
 * Return a formatted Discord time string
 * @param {String} [unixTime] Unix time
 * @param {String} [suffix] Custom suffix.
 * + Default: short date time (`June 27, 2021 9:48 PM`)
 * + `F`: long date time      (`Sunday, June 27, 2021 9:48 PM`)
 * + `d`: short date          (`06/27/2021`)
 * + `D`: long date           (`June 27, 2021`)
 * + `t`: short time          (`9:48 PM`)
 * + `T`: long time           (`9:48:37 PM`)
 * + `R`: relative time       (`2 days ago`)
 *
 * (from https://pastebin.com/rJFE9yxq)
 * @returns date and time string
 */
const discordTime = (unixTime = Date.now(), suffix = '') => `<t:${Math.floor(unixTime / 1000)}${suffix ? ':' + suffix : ''}>`

/**
 * Check if string is a Discord channel.
 * @param {String} text Channel in "`<#11111111111111111>`" format
 * @returns {String} Channel id
 */
// valid snowflakes have 17-20 numbers (see /guides/snowflakes.md)
const isChannel = text => text && text.match(/(?<=<#)[0-9]{17,20}(?=>)/) && text.match(/(?<=<#)[0-9]{17,20}(?=>)/)[0]

/** The different permission levels and their checks */
const PermLevels = {
  lmao: {
    level: 5,
    // Check if the message author is in the list of developers
    /** @param {import('./sendMsg')} msg */
    check: msg => devs.includes(msg.author.id)
  },
  'Bot Support': {
    level: 4,
    // Check if the message author is in the list of bot support people
    /** @param {import('./sendMsg')} msg */
    check: msg => botSupport.includes(msg.author.id)
  },
  Administrator: {
    level: 3,
    // Check if the message author has the 'Administrator' permission
    /** @param {import('./sendMsg')} msg */
    check: msg => msg.guild.members.cache.get(msg.author.id).permissions.any(Permissions.FLAGS.ADMINISTRATOR)
  },
  Moderator: {
    level: 2,
    // Check if the message author has the 'Manage Messages' or 'Manage Roles' permission
    /** @param {import('./sendMsg')} msg */
    check: msg => msg.guild.members.cache.get(msg.author.id).permissions.any(Permissions.FLAGS.MANAGE_MESSAGES + Permissions.FLAGS.MANAGE_ROLES)
  },
  User: {
    level: 1,
    check: () => true
  }
}

/**
 * Get the user permission level
 * @param {import('./sendMsg')} msg Client message
 * @returns {Number} The permission level
 */
const userPerms = msg => {
  // get the user perm level
  let userPermLevel = 1
  // by checking each permission
  for (const perm of Object.values(PermLevels)) {
    // record the *highest* perm level the user have
    if (perm.check(msg) && userPermLevel < perm.level) userPermLevel = perm.level
  }
  return userPermLevel
}

/**
 * Check if user has the appropriate permission level for a certain command
 * @param {Object} command The command object
 * @param {import('./sendMsg')} msg Discord message
 * @returns {Boolean} True or false
 */
const hasPerms = (command, msg) => {
  // get the perm object
  const perm = PermLevels[command.info.permLevel]
  if (perm) {
    // check if the user perm level is equal to or greater than the perm given
    return userPerms(msg) >= perm.level
  } else {
    logUrgent(`Error: No ${command.info.permLevel} permLevel for ${command}!`)
    return false
  }
}

// export the variables
module.exports = { intents, partials, prefix, botColor, infoFields, botName, botDescription, botSupport, devs, presence, colors, discordTime, isChannel, PermLevels, userPerms, hasPerms }
