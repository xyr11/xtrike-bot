const mongoose = require('mongoose')

/*
[{
  guildId: '123456',
  data: [
    {
      url: 'https://discord.com/channels/...',
      channel: '123456',
      image: 'https://cdn.discord.com/...',
      text: 'image ocr content',
      error: {
        present: result.IsErroredOnProcessing,
        message: result.ErrorMessage,
        details: result.ErrorMessage
      },
      when: '1600001',
      processTime: process.ProcessingTimeInMilliseconds
    }
    //, ...
  ],
  excludedChannels: [
    '654321',
    '101010'
  ],
  totalToday: 42,
  messageInit: {} // message id idk how to make it the Message thing with more info
}]
*/

const schema = new mongoose.Schema({
  guildId: String,
  data: Array,
  excludedChannels: Array,
  totalToday: Number,
  messageInit: Object
})

module.exports = mongoose.model('images', schema)
