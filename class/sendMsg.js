const Discord = require('discord.js') // eslint-disable-line no-unused-vars
const logger = require('../modules/logger')
const { deferEmoji, prefix } = require('../modules/base')

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

  /** Default log */
  log (...text) { logger.logger(null, ...text) }
  /** Info log (color is blue) */
  info (...text) { logger.logger('info', ...text) }
  /** Warn log (color is yellow) */
  warn (...text) { logger.logger('warn', ...text) }
  /** Urgent log (color is red) */
  urgent (...text) { logger.logger('err', ...text) }
  /** Success log (color is green) */
  good (...text) { logger.logger('good', ...text) }
  /* logs stuff in a gray color i really dont know what to add here */
  logGray (...text) { logger.logger('gray', ...text) }

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
      // If deferEmoji is a snowflake then get the GuildEmoji representation of it, otherwise return the unicode emoji
      const guildEmote = deferEmoji.match(/[0-9]{2,}/) ? this.client.emojis.cache.get(deferEmoji) : deferEmoji
      // Add reaction as a response that the message has been acknowledged, much like how the "Xtrike Bot is thinking..." works
      e = await this.react(guildEmote).catch(() => this.react('💭').catch(() => {}))
      /** @type {Discord.MessageReaction} */
      this.deferReact = e
    } if (this.isSlash) {
      // Defer command application
      e = await this.message.deferReply({ ...interactionOptions, ephemeral: this.ephemeral || false })
      this.deferred = true
    }
    return e
  }

  /** Remove defer reaction (for Messages) */
  async removeDeferReact () {
    return this.deferReact && this.deferReact.remove().catch(() => {})
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
      this.removeDeferReact()
    } else {
      // send as Interaction
      if (this.sent) e = await this.message.followUp(payload) // follow up if there's a sent message already
      else if (this.deferred) e = await this.message.editReply(payload) // if the application command is deferred, edit the reply
      else e = await this.message.reply(payload) // if not, just reply to the application command
    }
    // after the async stuff finishes:
    this.sent = e
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
      this.removeDeferReact()
    } else {
      // send as Interaction
      if (this.sent) e = await this.message.followUp(payload) // follow up if there's a sent message already
      else if (this.deferred) e = await this.message.editReply(payload) // if the application command is deferred, edit the reply
      else e = await this.message.reply(payload) // if not, just reply to the application command
    }
    // after the async stuff finishes:
    this.sent = e
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
    this.removeDeferReact()
    // after the async stuff finishes:
    this.sent = e
    return e
  }
}

module.exports = SendMsg
