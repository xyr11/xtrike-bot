const BotInfo = require('../schemas/botInfos')

/**
 * Store bot info
 * @param {String} _id Entry name
 * @param {*} d Data
 */
exports.storeInfo = async (_id, d) => {
  // check if there are any previous entries with the same id
  const results = await BotInfo.find({ _id })
  // if yes then update that one
  if (results.length) await BotInfo.updateOne({ _id }, { d })
  // if no then create a new one instead
  else await new BotInfo({ _id, d }).save()
}

/**
 * Get bot info
 * @param {String} _id Entry name
 * @returns Stored data
 */
exports.getInfo = async (_id) => {
  const result = await BotInfo.findOne({ _id })
  if (result) return result.d
}
