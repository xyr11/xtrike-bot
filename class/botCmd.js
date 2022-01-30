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
   * @param {String} name Name of the command
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
  setOption (option) { return this.#setX({ option }) }
  /** @param {String} similar */
  setSimilar (similar) { return this.#setX({ similar }) }
  /** @param {String[]} aliases */
  setAliases (aliases) { return this.#setX({ aliases }) }
  /** @param {String} permLevel */
  setPerm (permLevel) { return this.#setX({ permLevel }) }

  // Set command config properties
  /** @param {Boolean} requiredArgs */
  requiredArgs (requiredArgs = true) { return this.#setX({ requiredArgs }) }
  /** @param {Boolean} dank */
  isDank (dank = true) { return this.#setX({ dank }) }
  /**
   * Set command interaction options
   * @param {Object} options
   */
  // todo: documentation of this
  setOptions (options) { return this.#setX({ options }) }

  // The main function of the command
  /** @param {(msg: import('./sendMsg'), args: String[]) => Any} run */
  func (run) { return this.#setX({ run }) }
}

module.exports = BotCmd
