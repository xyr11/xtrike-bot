const BotInfo = require('../schemas/botInfos')

/**
 * Store bot info
 * @param {String} _id Entry name
 * @param {*} d Data
 */
exports.storeInfo = async (_id, d) => {
  // Check if there are any previous entries with the same id
  const results = await BotInfo.find({ _id })
  // If yes then update that one
  if (results.length) await BotInfo.updateOne({ _id }, { d })
  // If no then create a new one instead
  else await new BotInfo({ _id, d }).save()
}

/**
 * Get bot info
 * @param {String} _id Entry name
 * @returns {Any} stored data
 */
exports.getInfo = async (_id) => {
  const result = await BotInfo.findOne({ _id })
  if (result) return result.d
}

/**
 * Get keys
 * @function
 * @returns {[String]}
 */
exports.getKeys = async () => await BotInfo.find().distinct('_id')

/**
 * Get all
 * @function
 * @returns {[Object<String, Any>]}
 */
exports.getAll = async () => await BotInfo.find()
