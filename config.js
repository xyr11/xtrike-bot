const chalk = require('chalk')
const { Intents } = require('discord.js')

// Inspired by https://github.com/AnIdiotsGuide/guidebot (config.js.example)
// License: MIT License (https://github.com/AnIdiotsGuide/guidebot/blob/master/LICENSE)

/**
 * The holy grail of const variable keeping, the config module!
 */
const config = {

  // Discord client intents and partials
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ],
  partials: [

  ],

  // user ids of various important people
  botSupport: [

  ],
  devs: [
    '681766482304434187'
  ],

  // prefix of the bot
  prefix: ';',

  // bot id
  botId: '748386919460765706',

  // support server server id
  supportServer: '764355609973227580',
  // special channels (all can be found on official support server!)
  errLog: '781136504382160898',
  pingArea: '904006592347897896',

  // bot presence
  presence: {
    activity: 'bangers like you',
    activityType: 'LISTENING',
    status: 'online'
  },

  // colors
  colors: {
    main: '#77e4ff',
    red: '#F04848',
    green: '#2ecc71'
  },

  /**
   * Format the date and time with toLocaleString
   * @param {String} unixTime unix time
   * @returns Date and time based on timezone
   */
  time: (unixTime = Date.now()) => new Date(+unixTime).toLocaleString('us', { timeZone: process.env.TIMEZONE ?? 'Etc/UTC' }),

  // permission levels
  permLevels: [
    {
      level: 5,
      name: 'lmao',
      check: message => {
        const user = message.author ?? message.user
        // Check the list of developer user ids
        return config.devs.includes(user.id)
      }
    },
    {
      level: 4,
      name: 'Bot Support',
      check: message => {
        const user = message.author ?? message.user
        // Check the list of botSupport user ids
        return config.botSupport.includes(user.id)
      }
    },
    {
      level: 3,
      name: 'Server Owner',
      // If the guild owner id matches the message author's ID, then it will return true.
      check: message => {
        const user = message.author ?? message.user
        return message.guild?.ownerId === user.id
      }
    },
    {
      level: 2,
      name: 'Moderator',
      // The following lines check the guild the message came from for the roles.
      // Then it checks if the member that authored the message has the role.
      // If they do return true, which will allow them to execute the command in question.
      // If they don't then return false, which will prevent them from executing the command.
      check: message => {
        try {
          const modRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === message.settings.modRole.toLowerCase()) || message.guild.roles.cache.find(r => r.name.toLowerCase() === message.settings.adminRole.toLowerCase())
          if (modRole && message.member.roles.cache.has(modRole.id)) return true
        } catch (e) {
          return false
        }
      }
    },
    {
      level: 1,
      name: 'User',
      check: (message) => true
    }
  ],

  /**
   * Get the user perms
   * @param {Client} message Discord property thing
   * @returns the permission object
   */
  getUserPerms: (message) => {
    // get the user perm level
    let userPermLevel = 0
    // by checking each permission
    for (const permLevel of config.permLevels) {
      // record the *highest* perm level the user have
      if (permLevel.check(message) && userPermLevel < permLevel.level) userPermLevel = permLevel
    }
    return userPermLevel
  },

  /**
   * Check if user has perms in commands
   * @param {String} permName the name of the perm, commonly used in <command>.info.permLevel
   * @param {Discord} message Discord  message
   * @returns Boolean
   */
  hasPerms: (permName, message) => {
    // find the object that has the same name as the permName
    const perm = config.permLevels.find(l => l.name === permName)
    // get the user perm level
    const userPermLevel = config.getUserPerms(message).level
    // check if the user perm level is equal to or greater than the perm given
    if (!perm) {
      console.log(chalk.red(`Error: No ${permName} permLevel!`))
      return false
    } else {
      return userPermLevel >= perm.level
    }
  }
}

module.exports = config
