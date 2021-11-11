# Xtrike Bot
A multi-purpose Discord bot written in [Discord.js](https://discord.js.org) that does all sorts of bot stuff. \
And it's open-source!

[![Status](https://img.shields.io/uptimerobot/status/m786499889-6b41061a49e587f762227724)](https://replit.com/@xyr11/xtrike-bot) [![License](https://img.shields.io/github/license/xyr11/xtrike-bot)](#license) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![Current Version](https://img.shields.io/github/package-json/v/xyr11/xtrike-bot)](https://github.com/xyr11/xtrike-bot/blob/main/package.json)

## Features
### Search for text in images!
Can't find the image that your friend send? Well, you can now search for them by using words! Powered by [OCRSpace](https://ocr.space/) and [Fuse.js](https://fusejs.io/).

### Send a Twitter or TikTok link and the bot will extract the raw video!
It's a real inconvenience if someone sent an external link to a video. But now, it wouldn't be anymore! Powered by [youtube-dl](http://ytdl-org.github.io/youtube-dl/).

### And More In The Future!
Hang tight.

## Versions

### 0.2 ***(Dev To-do List)***
Big changes! Slash commands beta, changed the events handler, added & updated many commands, new auto responses

General
- [ ] Beta support for dual command handlers, `messageCreate` and `interactionCreate` (at the same time!)
- [x] Replaced events handler to accommodate different arguments required by each of the events (8f0e007)
- [x] Added helpful [JSDoc](https://en.wikipedia.org/wiki/JSDoc) comments to help with development (8f0e007)
- [x] More `test` options (92c19f9, a27febc)
- [x] Removed old README.md and integrated it to the current one (5111b52) and added more shields (2d881ea)

Help
- [x] Added a "Did you mean" part if there aren't any matches (d102252, 2f9e75a)
- [x] Added a `thumbnail` option for the help embed (97ca5ce)
- [x] Instead of adding the prefix per line, `$$` will now be used instead to substitute the current prefix (61da3cc)
- [x] Added "Options" and "Similar" to its own embed field (f47146b)

hmm
- [x] Won't reply to messages anymore (5111b52)

Image search
- [x] *New defaults*: It will search for images at most 7 days old and from the current channel only. (a6a6be5, a5af925)
- [x] Updated the help embed (a6a6be5)
- [x] Fixed search parameters for optimal results (a6a6be5)
- [x] Cut the amount of results to 10 because Discord messages only support up to 10 embeds (a27912a, 240db89)
- [x] Automatically retry if script encounters a FetchError (548a61b)
- [ ] Significantly changed the way how data is saved on database
- [ ] Limited the author data that will be stored on database (12bab96)

Ping
- [x] Removed reliance on a custom `pingArea` channel and instead it will just edit the message in the current channel. (34bf75c)

Reboot
- [x] Will log to console and change the activity text if bot is rebooting (e4561b8)

Sniper
- [x] Added `pls snipe`, `editsnipe`, and `reactionsnipe` from [DankMemer/sniper](https://github.com/DankMemer/sniper) (cc4e0b4, 18e8e0d, b84a868)
- [x] Added dank mode to support `pls` as a valid prefix (cc4e0b4)
- [ ] Variables will now be stored in the database so that it won't get lost if the bot restarts

Autoresponses
- [x] Modularized autoresponses (88dcf6b)
- [x] Added: Extract Twitter video from link and send it to current channel (6837ed6)

Command handler
- [x] `requiredArgs: true`: If a user doesn't give arguments, it will instead give the help embed of that command. (8dca861)
- [ ] Will now record statistics of how many times commands are used

Config.js
- [x] Added more intents and partials (a084ef0, 5e432df)
- [x] Removed `botId` (a084ef0)
- [x] `hasPerms()`: require the command object instead of just the name (8ab8478)

Error catching
- [x] Added filters when error needs to be sent in error logging channel or nah (c3580eb, b0c88f2)
- [x] Removed last channel tracking (2d321c1)
- [x] Added current time as fallback (44d469b)

### 0.1.4
Fixed bugs in `;image`, added the `;help` command, more settings in `.env`, better error logging

<details>
<summary>Changelog</summary>

`;image`
+ Fixed bugs regarding activating the command
+ Added `--here` to search for images in the current channel only

`;help`
+ Re-added the help command
+ Fixed the descriptions and usage of all commands

`.env`
+ Added presence options in `.env` so that changing them can be easier

Error logging
+ Better error logging, the full serialized error will now be sent to the error logging channel and the error.message will be the only thing shown in the current channel

Others
+ Cleaned `config.js`
+ Changed the run command on `.replit` to include installation of Node 16

</details>

### 0.1.3
Re-added `package-lock.json`, updates to the `image` command, better Replit integration, and more:

<details>
<summary>Changelog</summary>

+ Added include/exclude channel in  `image` command
+ Better `image` command replies
+ Better Replit integration in README
+ Updated `info` text
+ Console logging in ping
+ Changed presence activity
+ Added more emojis in `errorCatch.js`

</details>

### 0.1.2
Introducing databases and the beta version of the `image` command which finds text in images. Also:
<details>
<summary>Changelog</summary>

- added an `env` entry for the timezone
- updated the `.info` part of commands
- moved the 'ready' event to its own file
- added `.replit` file
- added a `Develop` guide in README.md
- added new modules

</details>

### 0.1.0
Rewrite for Discord.js v13 and replaced spaghetti code to an actual command handler. Also, modules, arrow functions, and more Modern Javascript™.

### 0.0.5
<details>
<summary>Changelog</summary>

+ `ping` command will just edit its embed rather than re-sending the message
+ Switched hosting platform from Heroku to Repl.it, modules that aren't needed by Repl.it will not be deleted so that local development of the bot is possible and also because Heroku will be our backup platform
+ Removed the owner ID in the main file (index.js) and placed it in the .env file

</details>

### 0.0.4
<details>
<summary>Changelog</summary>

```diff
+ Updated so that you can invite it on your own server!
+ Optimized all embed variables!
+ Revamped and optimized command finding to instead use arrays rather than your typical OR function
+ Added oxford to beta commands
+ Fixed a bug in the online command that it doesn't include Idle and Do Not Disturb members
+ Made uptime an official command
- Remove owner, no-sleep and restart commands completely
- Removed support for custom emojis from support server and replaced it with discord-wide emojis
```
</details>

### 0.0.3
<details>
<summary>Changelog</summary>

```diff
+ Fixed echo command that crashes the bot after not mentioning someone
+ Added "no-sleep", "restart", "hmm" commands
+ Added "sad", "uptime", and "restart" as beta commands
+ Added all commands with its corresponding 'help' guides (e.g. ;ping help)
+ Added a new update naming system
- Removed "hmm" command from beta commands to be an official command
- No-sleep command deprecated
```
</details>

### 0.0.2 and 0.0.1
The bare bones of the bot, with very limited features.

## Develop
### Prerequisites
+ [Git](https://git-scm.com/downloads)
+ [Node.js 16.6 or later (preferably the latest version)](https://nodejs.org/en/download/)
+ [a MongoDB database](https://www.mongodb.com/)
+ [an OCRSpace API key](https://ocr.space/ocrapi)
+ [Replit account (optional)](https://replit.com)

### Configure repository
1. *If you're using Replit*, click: [![Run on Replit link](https://replit.com/badge/github/xyr11/xtrike-bot)](https://replit.com/github/xyr11/xtrike-bot).

   *If not*, then clone the repository via Git
   ```
   cd "C:/Path/of/folder/you/want/this/repo/to/go"
   git clone https://github.com/xyr11/xtrike-bot.git && cd xtrike-bot && npm i
   ```

2. *If you're using Replit*, add the keys and values in the System Environmental Variables part, following the naming scheme of the keys below [(see the Replit docs for more info)](https://docs.replit.com/programming-ide/storing-sensitive-information-environment-variables).

   *If not*, then create a `.env` file, copy the stuff below and add the actual values after the equal symbol
   ```
   DISCORD_TOKEN=your-discord-token
   CLIENT_ID=your-discord-client-id
   MONGO_URI=your-mongo-db-uri
   OCRSPACE_KEY=your-ocrspace-key
   ```

3. On the `config.json` file, add values to the `exports.botSupport`, and `exports.devs` variables. Read the comments to see what they do.

### Run repository
*If you're on Replit*, you should press the big "Run" button.

*If not*, enter the following command:
```
npm start
```
If no errors are encountered, you will be able to see this message if the bot successfully logs in to Discord:
```
Ready as <Bot username>! (<Date and time>) 🤖
```

### Customizing the bot
You can add additional `.env` variables to customize the bot. See the documentation below. A template can also be found on `.env.example` (if you are not using Replit).

<details>
<summary>Documentation</summary>

```
# Bot prefix
PREFIX=;

# If you want to customize the timezone. Needs a valid TZ name (https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
TIMEZONE=Antarctica/South_Pole

# Slash commands options
# Deploy slash commands in all servers?
DEPLOY_SLASH=false
# The id of the testing server if DEPLOY_SLASH is not true. If DEPLOY_SLASH is not true, the bot will only deploy slash commands in the test server.
BOT_SERVER=777777777777777777

# Error logging channel id
# All errors encountered and caught by the bot or process will be send in the specified channel. Note that this may include personal info such as folder names if you're developing this locally.
ERR_LOG=777777777777777777

# Presence
# Status: online/idle/dnd/invisible
STATUS=online
# Activity type: PLAYING/WATCHING/LISTENING/COMPETING
ACTIVITYTYPE=PLAYING
# Activity text, the one that will show up in "Playing ..."
PRESENCE=I am online!
# If you want the "Online in mobile" status, set to `true`. Will ignore ACTIVITYTYPE.
ISMOBILE=
```

</details>

### Updating the cloned repository (for Git)
To update the code, enter:
```
git fetch --all && git reset --hard origin/main && npm i
```
***NOTE: This will overwrite all files that you have modified, so you will lose them.*** If you want it to be saved permanently then I suggest forking the repository instead and doing `git merge` with your own version every time there is a new update.

## License
[MIT License](https://github.com/xyr11/xtrike-bot/blob/main/LICENSE)

## Contact
[Join the official support and dev Discord server!](https://discord.gg/x3F22hN)

[@xy_rus](https://twitter.com/xy_rus) on bird app <br>
[Xtrike#<i>0507</i> (id: 681766482304434187)](https://discord.com) on imagine a place

## Credits
Huge thank you to [Worn Off Keys's discord.js playlist](https://www.youtube.com/playlist?list=PLaxxQQak6D_f4Z5DtQo0b1McgjLVHmE8Q), to [the *An Idiot's Guide* guide](https://anidiots.guide/), and finally to [Discord.js Guide](https://discordjs.guide/), especially with the new and spicy v13 stuff. A huge thank also to [Replit](https://replit.com) for the bot hosting.
