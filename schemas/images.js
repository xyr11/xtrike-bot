const mongoose = require('mongoose')

/** The schema of the Images collection */
const schema = new mongoose.Schema({
  guildId: String,
  data: Array,
  excludedChannels: Array,
  totalToday: Number,
  messageInit: Object
})

module.exports = mongoose.model('images', schema)
