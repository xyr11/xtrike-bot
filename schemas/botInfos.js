const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  _id: String,
  d: mongoose.Mixed
}, { versionKey: false })

module.exports = mongoose.model('botInfos', schema)
