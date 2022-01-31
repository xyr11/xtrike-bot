/**
 * [Source documentation](https://discord.com/developers/docs/interactions/application-commands)
 *
 * @typedef {Object} applicationCommandOptionChoice If you specify `choices` for an option, they are the only valid values for a user to pick.
 * @prop {String} name 1-100 character choice name
 * @prop {String|Number} value value of the choice, up to 100 characters if string
 *
 * @typedef {Object} applicationCommandOption The parameters for the slash command.
 * @prop {1|2|3|4|5|6|7|8|9|10} type the type of option
 * - 1: `SUB_COMMAND`
 * - 2: `SUB_COMMAND_GROUP`
 * - 3: `STRING`
 * - 4: `INTEGER`	(Any integer between -2^53 and 2^53)
 * - 5: `BOOLEAN`
 * - 6: `USER`
 * - 7: `CHANNEL`	(Includes all channel types + categories)
 * - 8: `ROLE`
 * - 9: `MENTIONABLE`	(Includes users and roles)
 * - 10: `NUMBER`	(Any double between -2^53 and 2^53)
 * @prop {String} name 1-32 character name
 * - Command names must match the following regex `^[\w-]{1,32}$` with the unicode flag set
 * - If there is a lowercase variant of any letters used, you must use those
 * @prop {String} description 1-100 character description
 * @prop {Boolean} [required] if the parameter is required or optional -- default `false`
 * @prop {applicationCommandOptionChoice[]} [choices] choices for `STRING`, `INTEGER`, and `NUMBER` types for the user to pick from, max 25
 * @prop {applicationCommandOption[]} [options] if the option is a subcommand or subcommand group type, these nested options will be the parameters
 * @prop {Number[]} [channel_types] if the option is a `CHANNEL` type, the channels shown will be restricted to these types
 * @prop {Number} [min_value] if the option is an `INTEGER` or `NUMBER` type, the minimum value permitted
 * @prop {Number} [max_value] if the option is an `INTEGER` or `NUMBER` type, the maximum value permitted
 * @prop {Boolean} [autocomplete] if autocomplete interactions are enabled for this `STRING`, `INTEGER`, or `NUMBER` type option
 * - `autocomplete` may not be set to `true` if choices are present
 * - options using `autocomplete` are not confined to only use choices given by the application.
 */

/** A command creator for the bot */
class BotCmd {
  /** A private method that sets the properties of `this` */
  // if you see an 'Unexpected character' error: see https://stackoverflow.com/a/52237988/12180492
  #setX (obj) {
    for (const key of Object.keys(obj)) {
      this[key] = obj[key]
      this.info[key] = obj[key] // backward compatibility // todo: this is temp in the meantime
    }
    return this
  }

  // Set common command properties, usually shown in the help embed
  /**
   * Creates a new bot command with default properties
   * @param {String} name Name of the command. Must be the same as the file name.
   */
  constructor (name) { return this.#setX({ info: {}, name, category: 'General', permLevel: 'User' }) }
  /** @param {String} category */
  setCategory (category) { return this.#setX({ category }) }
  /** @param {String} thumbnail */
  setThumb (thumbnail) { return this.#setX({ thumbnail }) }
  /** @param {String} description */
  setDescription (description) { return this.#setX({ description }) }
  /** @param {String} usage */
  setUsage (usage) { return this.#setX({ usage }) }
  /** @param {String} option */
  setOptionText (option) { return this.#setX({ option }) }
  /** @param {String} similar */
  setSimilar (similar) { return this.#setX({ similar }) }
  /** @param {String[]} aliases */
  setAliases (...aliases) { return this.#setX({ aliases }) }
  /** @param {String} permLevel */
  setPerm (permLevel) { return this.#setX({ permLevel }) }

  // Set command config properties
  /** @param {Boolean} requiredArgs */
  requiredArgs (requiredArgs = true) { return this.#setX({ requiredArgs }) }
  /** @param {Boolean} dank */
  isDank (dank = true) { return this.#setX({ dank }) }
  /**
   * Set command interaction options
   * @param {applicationCommandOption[]} options
   */
  setOptions (...options) { return this.#setX({ options }) }

  // The main function of the command
  /** @param {(msg: import('./sendMsg'), args: String[]) => Any} run */
  setFunction (run) { return this.#setX({ run }) }
}

module.exports = BotCmd
