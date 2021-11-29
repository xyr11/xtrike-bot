const { Intents, Message, Interaction } = require('discord.js') // eslint-disable-line no-unused-vars
const chalk = require('chalk')
const { botPrefix, status, actType, actName, timezone } = require('../config')

/** Bot intents */
const intents = [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS
]
/** Bot partials (https://discordjs.guide/popular-topics/partials.html) */
const partials = ['MESSAGE', 'REACTION', 'USER']

/** Prefix of the bot */
const prefix = botPrefix || ';'

// User ids of various important people
/** Bot developer user ids */
const devs = ['681766482304434187']
/** Bot support user ids */
const botSupport = []

/** Bot presence based on env variables */
const presence = {
  status: status ?? 'online',
  activityType: actType ?? 'PLAYING',
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
 * Get date and time string formatted using the timezone given in .env
 * @param {String} [unixTime] Unix time
 * @returns {String} Date and time string
 */
const time = (unixTime = Date.now()) => new Date(+unixTime).toLocaleString('us', { timeZone: timezone ?? 'Etc/GMT' })

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
 * Get user from Message or Interaction
 * @param {Message|Interaction} thing
 * @returns User object
 */
const user = thing => thing.author ?? thing.user

/** The different permission levels and their checks */
const PermLevels = {
  lmao: {
    level: 5,
    // Check the list of developer user ids
    check: message => devs.includes(user(message).id)
  },
  'Bot Support': {
    level: 4,
    // Check the list of botSupport user ids
    check: message => botSupport.includes(user(message).id)
  },
  'Server Owner': {
    level: 3,
    // If the guild owner id matches the message author's ID, then it will return true.
    check: message => message.guild?.ownerId === user(message).id
  },
  Moderator: {
    level: 2,
    // The following lines check the guild the message came from for the roles.
    // Then it checks if the member that authored the message has the role.
    // If they do return true, which will allow them to execute the command in question.
    // If they don't then return false, which will prevent them from executing the command.
    check: message => {
      try {
        const modRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === message.settings.modRole.toLowerCase()) ||
          message.guild.roles.cache.find(r => r.name.toLowerCase() === message.settings.adminRole.toLowerCase())
        if (modRole && message.member.roles.cache.has(modRole.id)) return true
      } catch (e) {
        return false
      }
    }
  },
  User: {
    level: 1,
    check: () => true
  }
}

/**
 * Get the user permission level
 * @param {Client} message Client message
 * @returns {Number} The permission level
 */
const userPerms = message => {
  // get the user perm level
  let userPermLevel = 1
  // by checking each permission
  for (const perm of Object.values(PermLevels)) {
    // record the *highest* perm level the user have
    if (perm.check(message) && userPermLevel < perm.level) userPermLevel = perm.level
  }
  return userPermLevel
}

/**
 * Check if user has the appropriate permission level for a certain command
 * @param {Object} command The command object
 * @param {Discord} message Discord  message
 * @returns {Boolean} True or false
 */
const hasPerms = (command, message) => {
  // find the object that has the same name as the permName
  const perm = PermLevels[command.info.permLevel]
  if (perm) {
    // check if the user perm level is equal to or greater than the perm given
    return userPerms(message) >= perm.level
  } else {
    console.log(chalk.red(`Error: No ${command.info.permLevel} permLevel for ${command}!`))
    return false
  }
}

// export the variables
module.exports = { intents, partials, prefix, botSupport, devs, presence, colors, time, discordTime, user, PermLevels, userPerms, hasPerms }
