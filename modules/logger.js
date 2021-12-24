const chalk = require('chalk')

/**
 * Console logger
 * @param {null|'info'|'warn'|'err'|'good'|'gray'} type
 * @param {Any[]} input
 */
const logger = (type, ...input) => {
  if (!input || !input.length) return
  // convert objects and arrays to string
  const text = input.map(a => typeof a === 'object' ? JSON.stringify(a) : a).reduce((a, b) => a + ' ' + b)
  // log it in console with their own colors
  const colorMatch = { info: 'blue', warn: 'yellow', err: 'red', good: 'green', gray: 'gray' }
  console.log(new Date(), type ? chalk[colorMatch[type]](text) : text)
}

/** Default log */
const log = (...text) => { logger(null, ...text) }
/** Info log (color is blue) */
const logInfo = (...text) => { logger('info', ...text) }
/** Warn log (color is yellow) */
const logWarn = (...text) => { logger('warn', ...text) }
/** Urgent log (color is red) */
const logUrgent = (...text) => { logger('err', ...text) }
/** Success log (color is green) */
const logGood = (...text) => { logger('good', ...text) }
/** logs stuff in a gray color i really dont know what to add here */
const logGray = (...text) => { logger('gray', ...text) }

module.exports = { logger, log, logInfo, logWarn, logUrgent, logGood, logGray }
