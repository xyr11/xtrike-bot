// Inspired by https://github.com/AnIdiotsGuide/guidebot (config.js.example), MIT License

// Main bot stuff
// Prefix of the bot (optional, default is ";") ========================
// You can use more than 1 character here and any character except a
// space. This will have no effect if user used slash commands (if slash
// commands are deployed).
const botPrefix = ';'
// Name of the bot (optional) ==========================================
const botName = 'Xtrike Bot'
// Description of the bot (optional) ===================================
// It can have multiple lines and Discord embed formatting.
const botDescription = 'Xtrike Bot is a multi-purpose bot.'
// Bot theme color (optional) ==========================================
// Used for the color of embeds sent by the bot. Use a hex color value
// like "#RRGGBB". Default value is "#E3E5E8"
const botColor = '#E3E5E8'
// Info fields (optional) ==============================================
// This is an array of fields that will be shown in the `;info` embed.
// Fields needs a `name` and `value` property, and they support Discord
// embed formatting too.
const infoFields = [
  {
    name: '💬 Commands',
    value: `Prefix: \`${botPrefix}\`
For commands, type \`${botPrefix}commandName\`.
To get help, enter \`${botPrefix}help commandName\``
  }
]

// Discord Client ID and token =========================================
// Can be found in https://discord.com/developers/applications
// Go to the OAuth2 tab > Client information > Client ID
const clientId = '012345678901234567'
// Go to the Bot tab > Build-A-Bot > Token
const discordToken = 'your-discord-token'

// Mongo URI ===========================================================
// The location of the MongoDB database to store stuff. See
// https://docs.mongodb.com/manual/reference/connection-string/ for info
const mongoURI = 'mongodb://username:password@host/'

// OCR API key =========================================================
// Your OCR API key for getting text inside images. For multiple keys,
// split them using a pipe ("|").
const ocrApi = 'your-ocrspace-key'

// Oxford Dictionaries API ID and key ==================================
// Powered by Oxford Dictionaries. You can add multiple keys for each ID
// by splitting them with a pipe ("|").
const oxfordApi = [
  {
    id: 'myApiId',
    key: 'myApiKey|myApiKey2'
  }
]

// User IDs of people that has the 'Developer' role ====================
// They can reload a command, reboot the bot, and deploy slash
// commands. They also have access to beta commands (`isBeta: true`).
// This is a powerful role to give!
const devs = [
  // add values
  '012345678901234567'
]

// User IDs of people that has the 'Bot Support' role (optional) =======
// Right now they don't do anything but in the future this may change
const botSupport = [
  // add values
  '012345678901234567'
]

// Defer reaction on messages (optional) ===============================
// It's like the counterpart to the "Xtrike Bot is thinking..." text in
// slash commands, but instead it will react a certain emoji to the
// message. You can place a unicode emoji, or an id of a custom Discord
// emoji (bot must be in the server where the custom emoji is from).
const deferEmoji = '💭' // or '921418001826340904'

// Channel ID for error logging (optional) =============================
// All errors caught will be send in the specified channel. Note that
// the error message may include personal info such as folder names.
const errorLogging = '012345678901234567'

// Presence (all are optional)
// Status: [online]/idle/dnd/invisible = ===============================
const status = 'online'
// Activity type: [playing]/watching/listening/competing ===============
const actType = 'playing'
// Activity name, the text that will show up in "Playing..." ===========
const actName = ';info'
// Set the status to "Online in mobile device"? ========================
// If true, this will ignore `actType`
const isMobile = false

// export the variables
// don't touch this please!
module.exports = { botPrefix, botName, botDescription, botColor, infoFields, clientId, discordToken, mongoURI, ocrApi, oxfordApi, devs, botSupport, deferEmoji, errorLogging, actType, actName, status, isMobile }
