const Discord = require('discord.js') // eslint-disable-line no-unused-vars
const chalk = require('chalk')
const { time } = require('./base')
const { serializeError } = require('serialize-error')

// const run = func => func().then(() => this.logText && this.logger(this.logText)).catch(this.err)

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
    /** @type {Message} */
    this.sent = undefined
  }

  /**
   * Log text to console for .then
   * @param {*[]} text
   */
  logger (...text) {
    if (!text.length) return
    // convert to string
    text = text.map(a => {
      if (typeof a === 'object') a = JSON.stringify(a)
      if (typeof a === 'number') a += ''
      return a
    })
    if (this.log === 'info') console.log(chalk.blue(text))
    if (this.log === 'warn') console.log(chalk.yellow(time()), text)
    if (this.log === 'err') console.log(chalk.red(time()), text)
    if (this.log === 'good') console.log(chalk.green(time(), text))
  }

  /**
   * Console error logger for .catch
   * @param {Error} err
   */
  err (err) {
    this.log = 'err'
    this.logger(err, serializeError(err))
  }

  /**
   * Automatic logger and catcher, as long as you give the function
   * @param {Function} func
   */
  run (func) {
    func().then(() => this.logText && this.logger(this.logText)).catch(this.err)
  }

  /**
   * Log text after sending a message
   * @param {String} text
   * @param {undefined|'info'|'warn'|'err'|'good'} type
   */
  log (text, type) {
    if (!text) return
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
    if (this.isSlash) await this.message.deferReply({ ...interactionOptions, ephemeral: this.ephemeral || false }).then(() => { this.deferred = true }).catch(this.err)
  }

  /**
   * Send a message
   * @param {String|MessagePayload|InteractionReplyOptions} payload
   */
  async send (payload) {
    // send as Message
    if (this.isMsg) return await this.channel.send(payload).then(sent => (this.sent = sent && sent))
    // send as Interaction
    if (this.deferred) return await this.message.editReply(payload) // if the application command is deferred, just edit the reply
    // follow up if there is already an earlier sent message
    if (this.sent) return await this.message.followUp(payload).then(sent => (this.sent = sent && sent))
    // if not, just reply to the application command
    return await this.message.reply(payload).then(sent => (this.sent = sent && sent))
  }

  /**
   * Reply to the message
   * @param {String|MessagePayload|InteractionReplyOptions} payload
   * @param {Boolean=} pingUser whether to ping the user or not
   */
  async reply (payload, pingUser = true) {
    // send as Message
    if (this.isMsg) {
      // convert the payload into an object and add the repliedUser attribute
      if (typeof payload === 'string') payload = { content: payload, allowedMentions: { repliedUser: pingUser } }
      else payload = { ...payload, allowedMentions: { repliedUser: pingUser } }
      return await this.message.reply(payload).then(sent => (this.sent = sent && sent)) // send as Message
    }
    // send as Interaction
    // if the application command is deferred, just edit the reply
    if (this.deferred) return await this.message.editReply(payload).then(sent => (this.sent = sent && sent))
    // follow up if there is already an earlier sent message
    if (this.sent) return await this.message.followUp(payload).then(sent => (this.sent = sent && sent))
    // if not, just reply to the application command
    return await this.message.reply(payload).then(sent => (this.sent = sent && sent))
  }

  /**
   * Reply to an earlier message you sent
   * @param {String|MessagePayload|InteractionReplyOptions} payload
   */
  async followUp (payload) {
    return await this.isMsg
      ? this.message.reply(payload).then(sent => (this.sent = sent && sent)) // send as Message
      : this.message.followUp(payload).then(sent => (this.sent = sent && sent)) // send as Interaction
  }

  /**
   * Edit a sent message
   * @param {String|MessagePayload|InteractionReplyOptions} payload
   */
  async edit (payload) {
    if (!this.sent) throw new Error('No message to edit!')
    return await this.isMsg
      ? this.sent.edit(payload).then(sent => (this.sent = sent && sent)) // send as Message
      : this.message.editReply(payload).then(sent => sent) // send as Interaction
  }
}

module.exports = SendMsg
