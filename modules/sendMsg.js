const Discord = require('discord.js') // eslint-disable-line no-unused-vars
const chalk = require('chalk')
const { prefix, time } = require('./base')

class SendMsg {
  /** @param {Discord.Message|Discord.CommandInteraction} message */
  constructor (message) {
    // Set common properties -------------------------------------------
    /** @type {Discord.Client} */
    this.client = message.client
    /** @type {Discord.Guild} */
    this.guild = message.guild
    /** @type {Discord.Snowflake} */
    this.guildId = message.guildId
    /** @type {Discord.TextChannel} */
    this.channel = message.channel
    /** @type {Discord.Snowflake} */
    this.channelId = message.channelId
    /** @type {Discord.Snowflake} */
    this.id = message.id
    /** @type {Date} */
    this.createdAt = message.createdAt
    /** @type {Date} */
    this.editedAt = message.editedAt
    /** @type {number} */
    this.createdTimestamp = message.createdTimestamp
    /** @type {number} */
    this.editedTimestamp = message.editedTimestamp
    /** @type {Discord.MessageEmbed[]} */
    this.embeds = message.embeds
    /** @type {Discord.Collection<Discord.Snowflake, Discord.MessageAttachment>} */
    this.attachments = message.attachments
    /** @type {string} */
    this.content = message.content || ''
    /** @type {Discord.GuildMember} */
    this.member = message.member
    /** @type {Discord.MessageReference} */
    this.reactions = message.reactions
    /** @type {String} */
    this.url = message.url
    /** @type {Discord.MessageReference} */
    this.reference = message.reference
    /** @type {string} */
    this.commandName = message.commandName
    /** @type {string} */
    this.token = message.token
    /** @type {Discord.CommandInteractionOptionResolver} */
    this.options = message.options

    // Set custom properties -------------------------------------------
    /**
     * The original message
     * @type {Discord.Message|Discord.CommandInteraction}
     */
    this.message = message
    /* Type of the message whether it's a Message or a CommandInteraction */
    this.isSlash = !!this.message.applicationId
    this.isMsg = !this.message.applicationId
    /**
    * Author of the message
    * @type {Discord.User}
    */
    this.author = message.author ?? message.user
    /**
    * Content of the message excluding the prefix and extra spaces before and after text (basically the args)
    * @type {String}
    */
    this.text = this.content.replace(new RegExp(`\\s*(${prefix}|/|pls) *\\w+`), '').replace(/^ *| *$/g, '')
    /**
    * The sent response to the message (for the methods)
    * @type {Discord.Message}
    */
    this.sent = undefined
  }

  /**
   * The correct way to replace the content of the message, so that other properties will be updated
   * @param {String} content
   */
  setContent (content) {
    this.content = content
    this.text = content.replace(new RegExp(`\\s*(${prefix}|/|pls) *\\w+`), '').replace(/^ *| *$/g, '')
  }

  /** Console logger. Use `.log()` instead please */
  logger () {
    if (!this.logText || !this.logText.length) return
    const text = this.logText.map(a => {
      if (typeof a === 'object') a = JSON.stringify(a) // convert to string
      return a
    })
    if (!this.log) console.log(time(), text)
    if (this.log === 'info') console.log(chalk.blue(time(), text))
    if (this.log === 'warn') console.log(chalk.yellow(time()), text)
    if (this.log === 'err') console.log(chalk.red(time()), text)
    if (this.log === 'good') console.log(chalk.green(time(), text))
  }

  /**
   * Log text after sending a message
   * @param {'none'|'info'|'warn'|'err'|'good'} type
   * @param {String[]} text
   */
  log (type, ...text) {
    if (!text.length) return
    this.logText = text
    this.log = type
  }

  /**
   * React to the message
   * @param {Discord.EmojiIdentifierResolvable} emote
   * @returns {Promise<Discord.MessageReaction|false>}
   */
  async react (emote) {
    return this.isMsg && await this.message.react(emote)
  }

  /**
   * set if the application command is ephemeral (visible only to user) or not
   * @param {Boolean=} value
   */
  setEphemeral (value = true) { if (this.isSlash) this.ephemeral = value }

  /**
   * If you want to defer the reply for an application command
   * @param {Discord.InteractionReplyOptions} interactionOptions
   */
  async setDefer (interactionOptions) {
    /** @type {Discord.MessageReaction|Discord.Message} */
    let e
    if (this.isMsg) {
      // add reaction as a response that the message has been acknowledged
      e = await this.react(this.client.emojis.cache.get('921418001826340904') || '✅')
      /** @type {Discord.MessageReaction} */
      this.deferReact = e
    } if (this.isSlash) {
      // defer command application
      e = await this.message.deferReply({ ...interactionOptions, ephemeral: this.ephemeral || false })
      this.deferred = true
    }
    return e
  }

  /**
   * Send a message
   * @param {String|Discord.MessagePayload|Discord.InteractionReplyOptions} payload
   */
  async send (payload) {
    /** @type {Discord.Message|Discord.InteractionReplyOptions} */
    let e
    // send as Message
    if (this.isMsg) {
      e = await this.channel.send(payload)
      if (this.deferReact) await this.deferReact.remove() // remove reaction
    } else {
      // send as Interaction
      if (this.sent) e = await this.message.followUp(payload) // follow up if there's a sent message already
      else if (this.deferred) e = await this.message.editReply(payload) // if the application command is deferred, edit the reply
      else e = await this.message.reply(payload) // if not, just reply to the application command
    }
    // after the async stuff finishes:
    this.sent = e
    this.logger()
    return e
  }

  /**
   * Reply to the message
   * @param {String|Discord.MessagePayload|Discord.InteractionReplyOptions} payload
   * @param {Boolean=} pingUser whether to ping the user or not
   */
  async reply (payload, pingUser = true) {
    /** @type {Discord.Message|Discord.InteractionReplyOptions} */
    let e
    if (this.isMsg) {
      // send as Message
      // if payload is a string then convert the payload into an object and add the repliedUser attribute
      if (typeof payload === 'string') payload = { content: payload, allowedMentions: { repliedUser: pingUser } }
      // if not then add the allowedMentions property to the given object
      else payload = { ...payload, allowedMentions: { repliedUser: pingUser } }
      e = await this.message.reply(payload)
      if (this.deferReact) await this.deferReact.remove() // remove reaction
    } else {
      // send as Interaction
      if (this.sent) e = await this.message.followUp(payload) // follow up if there's a sent message already
      else if (this.deferred) e = await this.message.editReply(payload) // if the application command is deferred, edit the reply
      else e = await this.message.reply(payload) // if not, just reply to the application command
    }
    // after the async stuff finishes:
    this.sent = e
    this.logger()
    return e
  }

  /**
   * Edit a sent message
   * @param {String|Discord.MessagePayload|Discord.InteractionReplyOptions} payload
   */
  async edit (payload) {
    if (!this.sent) throw new Error('No message to edit!')
    /** @type {Discord.Message} */
    const e = this.isMsg ? await this.sent.edit(payload) : await this.message.editReply(payload)
    // after the async stuff finishes:
    this.sent = e
    this.logger()
    return e
  }

  /**
   * Reply to an earlier message you sent
   * @param {String|Discord.MessagePayload|Discord.InteractionReplyOptions} payload
   */
  async replyToSent (payload) {
    /** @type {Discord.Message} */
    let e
    if (this.isMsg) {
      if (!this.sent) throw new Error('No earlier message to reply to!')
      await this.sent.reply(payload)
    } else {
      e = await this.message.followUp(payload)
    }
    if (this.deferReact) this.deferReact.remove() // remove reaction
    // after the async stuff finishes:
    this.sent = e
    this.logger()
    return e
  }
}

module.exports = SendMsg
