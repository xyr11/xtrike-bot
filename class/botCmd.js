/** A command creator for the bot. */
class BotCmd {
  /**
   * Set the properties of the command object
   * @param {Object.<String, Any>} object
   */
  setX (object) {
    // Loop on all properties of the object
    for (const key of Object.keys(object)) {
      this[key] = object[key] // Copy the property from the input object to `this`
      this.info[key] = object[key] // backward compatibility // todo: this is temp in the meantime
    }
    return this
  }

  /**
   * Creates a new bot command with default properties
   * @param {String} name Name of the command. Must be the same as the file name.
   */
  constructor (name) {
    // Check command name
    if (!name || typeof name !== 'string') throw new Error('Command name required')
    // Create a new command with the category set to General and permLevel to User
    return this.setX({ info: {}, name, category: 'General', permLevel: 'User' })
  }

  // Set common command properties, usually shown in the help embed
  /**
   * Category of the command
   * @param {String} category
   */
  setCategory (category) { return this.setX({ category }) }
  /**
   * Thumbnail that will be shown on the help embed
   * @param {String} thumbnail
   */
  setThumbnail (thumbnail) { return this.setX({ thumbnail }) }
  /**
   * Description of the command
   * @param {String} description
   */
  setDescription (description) { return this.setX({ description }) }
  /**
   * Show how the command will be used
   * @param {String} usage
   */
  setUsage (usage) { return this.setX({ usage }) }
  /**
   * Description of the different options of the command (for Message)
   * @param {String} option
   */
  setOptionText (option) { return this.setX({ option }) }
  /**
   * List of similar commands
   * @param {String} similar
   */
  setSimilar (similar) { return this.setX({ similar }) }
  /**
   * Aliases or alternate names of the command
   * @param {String[]} aliases
   */
  setAliases (...aliases) { return this.setX({ aliases }) }

  // Set command config properties
  /**
   * Minimum permLevel required to use the command
   * @param {String} permLevel
   */
  requiredPerm (permLevel) { return this.setX({ permLevel }) }
  /**
   * Are inputs or arguments required for the command to run
   * @param {Boolean} requiredArgs default value is true
   */
  isRequiredArgs (requiredArgs = true) { return this.setX({ requiredArgs }) }
  /** @param {Boolean} dank */
  isDank (dank = true) { return this.setX({ dank }) }
  /**
   * Set command interaction options
   * @param {import('discord.js').ApplicationCommandOption[]} options
   */
  applicationOptions (...options) { return this.setX({ options }) }

  /**
   * The main function to run
   * @param {(msg: import('./sendMsg'), args: String[]) => Any} run
   */
  callback (run) { return this.setX({ run }) }
}

module.exports = BotCmd
