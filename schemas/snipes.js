const mongoose = require('mongoose')

/** The schema of the Snipes collection */
const schema = new mongoose.Schema({
  _id: String,
  d: Object
}, { versionKey: false })

module.exports = mongoose.model('snipes', schema)
