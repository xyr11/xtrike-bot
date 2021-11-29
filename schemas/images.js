const mongoose = require('mongoose')

/** The schema of the Images collection. See `guides/fetchImage.md` for more info! */
const schema = new mongoose.Schema({
  f: Boolean,
  _id: String,
  g: String,
  c: String,
  a: String,
  i: String,
  d: mongoose.Mixed,
  w: Number,
  // pre-v0.1.4 schema
  guildId: String,
  data: mongoose.Mixed,
  excludedChannels: mongoose.Mixed,
  totalToday: Number,
  messageInit: Object
}, { versionKey: false })

module.exports = mongoose.model('images', schema)
