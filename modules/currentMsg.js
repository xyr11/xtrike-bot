/**
 * a variable for recording the current Message variable on commands for error tracking
 */
let msg = ''

/**
 * Save the current message here
 * @param {Message} message Message
 */
exports.save = function (message) { msg = message }

/**
 * Get the current Message variable saved
 * @returns Message
 */
exports.get = () => msg
