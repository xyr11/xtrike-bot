const Discord = require('discord.js') // eslint-disable-line no-unused-vars
const chalk = require('chalk')
const { time } = require('./base')

class SendMsg {
  /** @param {Discord.Message|Discord.CommandInteraction} message */
  constructor (message) {
    // set the message property to the message
    /** @type {Discord.Message|Discord.CommandInteraction} */
    this.message = message
    // set the type
    this.isSlash = !!this.message.applicationId
    this.isMsg = !this.message.applicationId
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
    /** @type {String} */
    this.commandName = message.commandName
    /** @type {Discord.CommandInteractionOptionResolver} */
    this.options = message.options
    /** @type {Discord.MessageReference} */
    this.reference = message.reference
    /** @type {Discord.User} */
    this.author = message.author ?? message.user
    /** @type {String} */
    this.content = message.content
    /** @type {Discord.Message} */
    this.sent = undefined
  }

  /** Console logger. Use `.log()` instead please */
  logger () {
    if (!this.logText.length) return
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
   * @param {Any[]} text
   */
  log (type, ...text) {
    if (!text.length) return
    this.logText = text
    this.log = type
  }

  /**
   * set if the application command is ephemeral (visible only to user) or not
   */
  ephemeral () {
    if (this.isSlash) this.ephemeral = true
  }

  /**
   * If you want to defer the reply for an application command
   * @param {Discord.InteractionReplyOptions} interactionOptions
   */
  async defer (interactionOptions) {
    if (!this.isSlash) return
    await this.message.deferReply({ ...interactionOptions, ephemeral: this.ephemeral || false })
    this.deferred = true
  }

  /**
   * Send a message
   * @param {String|Discord.MessagePayload|Discord.InteractionReplyOptions} payload
   */
  async send (payload) {
    let e
    // send as Message
    if (this.isMsg) e = await this.channel.send(payload)
    else {
      // send as Interaction
      // if the application command is deferred, just edit the reply
      if (this.deferred) e = await this.message.editReply(payload)
      else {
        // follow up if there is already an earlier sent message
        if (this.sent) e = await this.message.followUp(payload)
        // if not, just reply to the application command
        else e = await this.message.reply(payload)
      }
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
    let e
    if (this.isMsg) {
      // send as Message
      // if payload is a string then convert the payload into an object and add the repliedUser attribute
      if (typeof payload === 'string') payload = { content: payload, allowedMentions: { repliedUser: pingUser } }
      // if not then add the allowedMentions property to the given object
      else payload = { ...payload, allowedMentions: { repliedUser: pingUser } }
      e = await this.message.reply(payload)
    } else {
      // send as Interaction
      // if the application command is deferred, just edit the reply
      if (this.deferred) e = await this.message.editReply(payload)
      else {
        // follow up if there is already an earlier sent message
        if (this.sent) e = await this.message.followUp(payload)
        // if not, just reply to the application command
        else e = await this.message.reply(payload)
      }
    }
    // after the async stuff finishes:
    this.sent = e
    this.logger()
    return e
  }

  /**
   * Reply to an earlier message you sent
   * @param {String|Discord.MessagePayload|Discord.InteractionReplyOptions} payload
   */
  async followUp (payload) {
    const e = this.isMsg ? await this.message.reply(payload) : await this.message.followUp(payload)
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
    const e = this.isMsg ? await this.sent.edit(payload) : await this.message.editReply(payload)
    // after the async stuff finishes:
    this.sent = e
    this.logger()
    return e
  }
}

module.exports = SendMsg
