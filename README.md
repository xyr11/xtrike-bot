# Xtrike Bot
A multi-purpose Discord bot written in [discord.js](https://discord.js.org) that does all sorts of bot stuff.

[![Status](https://img.shields.io/uptimerobot/status/m786499889-6b41061a49e587f762227724)](https://replit.com/@xyr11/xtrike-bot)
[![License](https://img.shields.io/github/license/xyr11/xtrike-bot)](#license)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Current Version](https://img.shields.io/github/package-json/v/xyr11/xtrike-bot)](https://github.com/xyr11/xtrike-bot/blob/main/package.json)

## Features
### Search for text in images!
Can't find that one image your friend sent that got buried by a day's worth of messages? Well, you can now search for them! Powered by [OCRSpace](https://ocr.space/) and [Fuse.js](https://fusejs.io/). (Enter `;image` for more info.)

### Extract the raw video from external links!
It's a real inconvenience when you need to open links just to watch epic fails or low quality memes. So now, the bot will automatically extract and send the video whenever someone sends a link! Powered by [youtube-dl](http://ytdl-org.github.io/youtube-dl/).[^1]

### And more in the future!
Hang tight.

## Add the bot to your server
*Invite link will be available once the bot gets out of beta.*

## Changelog
[Check the CHANGELOG.md file](./CHANGELOG.md) for the complete changelog.

### 0.3.2
Major changes
- Updated discord.js to v13.6.0 and other dependencies
- Automatically enable slash commands and the ;image command in newly joined servers
- Update server count and delete ;image command data when bot leaves a server
- `deployslash` and `testingServer` config entry is deprecated
- Added the BotCmd class and moved initiating local modules inside the command function so it can be reloaded

Other stuff
- Fixes to sniper commands, ;image, ;help, ;server, and ;user
- Updated formatting on README file
- New config entry for `deferEmoji` for the sendMsg class
- discord.js embed methods deprecation fixes
- Added reloading modules
- Updated the video module to just give the source url instead of downloading it
- For Replit: no need to update Node every time the bot runs

## Endpoints
You can either use `GET` or `POST`.

Endpoint url for Xtrike Bot: https://xtrike-bot.xyr11.repl.co

Endpoint | Description | Returns
-- | -- | --
/stats | Get all bot statistics | `Object`
/stats/keys | Get the different statistics keys | `Array`
/stats/`commandName` <br> /stats/`key` | Get the individual values of the given command name or property | `String`

### Sample code
#### Check if bot is up
```js
const isUp = await fetch('https://xtrike-bot.xyr11.repl.co').then(res => res.text()).catch(console.error)
console.log('The bot is up:', !!isUp)
```

#### Get all statistics
```js
const stats = await fetch('http://localhost:3000/stats').then(res => res.json()).catch(console.error)
console.log(stats)
```

## Develop

### Prerequisites
+ [Git](https://git-scm.com/downloads)
+ [Node.js 16.9.0 or later](https://nodejs.org/en/download/)
+ [a MongoDB database](https://www.mongodb.com/)
+ [Replit account](https://replit.com) (*optional*)
+ API keys for the services below (*optional*)

### API services
+ [OCRSpace API](https://ocr.space/ocrapi) (API key)
+ [Oxford Dictionaries API](https://developer.oxforddictionaries.com/) (API ID and key)

### Configuring the repository
[Download the repo](https://github.com/xyr11/xtrike-bot/archive/refs/heads/main.zip) or clone it by entering this command on your console:
```
git clone https://github.com/xyr11/xtrike-bot.git
```

Then, install all the required dependencies using:
```
npm install
```

##### For Replit users:
[![Run on Replit](https://replit.com/badge/github/xyr11/xtrike-bot "'Run on Replit' button")](https://replit.com/github/xyr11/xtrike-bot) \
(or go to https://replit.com/github/xyr11/xtrike-bot)

### Setting up the bot account
On https://discord.com/developers/applications, click "New Application". Add your application name and press "Create" to create a new application. You can set your bot description in this page.

After that, go to the "Bot" tab. Click the "Add Bot" button and press the confirmation button. After that, enable all privileged intents in the "Privileged Gateway Intents" tab so that the bot can properly fetch data. You can also set a custom bot name and bot avatar in this page.

### Adding config variables
After that, rename the `example-config.js` file to `config.js` and replace the values of all the required variables to configure your bot. There are comments to help you out.

### Booting up the bot
Open your console and enter the following command to start your bot:
```
npm start
```
If no errors are encountered, you should be able to see the following message:
```
Ready as <Bot username>! 🤖 (<Date and time>)
```

##### For Replit users:
Just press the big "Run" button.

If you want to update to the latest version of Node manually due to new builds, enter `npm run replit-node-latest` on your shell (beside the console).

### Customizing the bot
You can customize the bot by replacing the default value of the optional variables on your `config.js` file.

<details>
<summary>Documentation</summary>

Variable | Default value | Description
-- | -- | --
`botPrefix` | "`;`" | You can use more than 1 character here and any character except a space. This will have no effect if user used slash commands (if slash commands are deployed).
`botName` | "`Xtrike Bot`" | Name of the bot.
`botDescription` | "`Xtrike Bot is a multi-purpose bot.`" | Description of the bot. It can have multiple lines and Discord embed formatting.
`botColor` | "`#E3E5E8`" | Used for the color of embeds sent by the bot. Use a hex color value like "#RRGGBB".
`infoFields` | Check file | Info fields. This is an array of fields that will be shown in the `;info` embed. Fields needs a `name` and `value` property, and they support Discord embed formatting too.
`botSupport` | N/A | User IDs of people that has the 'Bot Support' role. Right now they don't do anything but in the future this may change.
`deferEmoji` | "`💭`" | It's like the counterpart to the "Xtrike Bot is thinking..." text in slash commands, but instead it will react a certain emoji to the message. You can place a unicode emoji like "💭", or an id of a custom Discord emoji (bot must be in the server where the custom emoji is from) like "921418001826340904".
`errorLogging` | N/A | Channel ID for error logging. All errors caught will be send in the specified channel. Note that the error message may include personal info such as folder names.
`status` | "`online`" | Presence status: `online`/`idle`/`dnd`/`invisible`.
`actType` | "`playing`" | Activity type: `playing`/`watching`/`listening`/`competing`.
`actName` | "`;info`" | Activity name, the text that will show up in "Playing..."
`isMobile` | `false` | If you want to set the status to "Online in mobile device". If true, this will ignore `actType`.

</details>

### Updating the cloned repository (for Git)
To update the code, enter:
```
git fetch --all && git reset --hard origin/main && npm i
```
**NOTE: This will overwrite files that you may have modified** (other than the `config.js` file). If you don't want it to be overwritten then you can instead fork the repository and do `git merge` with your own version every time a new update releases.

## License
The code is licensed under [MIT License](https://github.com/xyr11/xtrike-bot/blob/main/LICENSE).

## Credits
Huge thank you to [Worn Off Keys's discord.js playlist](https://www.youtube.com/playlist?list=PLaxxQQak6D_f4Z5DtQo0b1McgjLVHmE8Q), to [the *An Idiot's Guide* guide](https://anidiots.guide/), and finally to [Discord.js Guide](https://discordjs.guide/), especially with the new and spicy v13 stuff. A huge thanks also to [Replit](https://replit.com) for the bot hosting.

[^1]: Supported sites: facebook.com, twitter.com, tiktok.com. Disclaimer: The bot only shares the source url of the video from the post containing it.
