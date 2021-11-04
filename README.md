# Xtrike Bot
a multi-purpose Discord bot written in [discord.js](https://discord.js.org) that does all sorts of bot stuff

[![Status](https://img.shields.io/uptimerobot/status/m786499889-6b41061a49e587f762227724)](https://replit.com/@xyr11/xtrike-bot) [![License](https://img.shields.io/github/license/xyr11/xtrike-bot)](#license) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) ![Current Version](https://img.shields.io/github/package-json/v/xyr11/xtrike-bot)

## Versions

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
<details>
<summary>Changelog</summary>

Rewrite for Discord.js v13 and replaced spaghetti code to an actual command handler. Also, modules, arrow functions, and more Modern Javascript™.

</details>

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
1. *If you're using Replit*, click the big gray button: [![on Replit](https://replit.com/badge/github/xyr11/xtrike-bot)](https://replit.com/github/xyr11/xtrike-bot).

   *If not*, then clone the repository via Git
   ```
   cd "C:/Path/of/folder/you/want/this/repo/to/go"
   git clone https://github.com/xyr11/xtrike-bot.git && cd xtrike-bot && npm i
   ```

2. *If you're using Replit*, add the keys and values in the System Environmental Variables part, following the naming scheme of the keys below [(see the Replit docs for more info)](https://docs.replit.com/programming-ide/storing-sensitive-information-environment-variables).

   *If not*, then create a `.env` file, copy the stuff below and replace the values with the actual value
   ```
   DISCORD_TOKEN=your-discord-token
   CLIENT_ID=your-discord-client-id
   MONGO_URI=your-mongo-db-uri
   OCRSPACE_KEY=your-ocrspace-key
   # If you want to customize the timezone. Needs a valid TZ name (en.wikipedia.org/wiki/List_of_tz_database_time_zones)
   TIMEZONE=Antarctica/South_Pole
   ```

3. On the `config.json` file, change the `exports.prefix`, `exports.botId`, `exports.botSupport`, `exports.devs`, `exports.botServer`, `exports.errLog`, and `exports.pingArea` variables to your own liking. Read the comments to see what they do.

### Run repository
*If you're on Replit*, you should press the big "Run" button.

*If not*, enter the following command:
```
npm start
```
If no errors are encountered, you will be able to see this message:
```
Ready as <Bot username>! (<Date and time>) 🤖
```

### Customizing the bot
You can add additional .env variables to customize the bot. See the documentation below.

<details>
<summary>Customize the presence details</summary>

```
STATUS=online          # online | idle | dnd | invisible
ACTIVITYTYPE=PLAYING   # PLAYING | WATCHING | LISTENING | COMPETING
PRESENCE=Bot is online
ISMOBILE=true          # If you want the "Online in mobile" status. Will ignore ACTIVITYTYPE.
```

</details>

### Updating local copy (for Git)
***NOTE: This will overwrite all files that you have modified, so you will lose them.** New files that you created will *not* be affected *unless* the latest commit has a file with the same filename in the same location.*

To update the code, enter the following:
```
git fetch --all && git reset --hard origin/main && npm i
```
If you want your created files to be saved permanently then I suggest forking this on GitHub and do Steps 1-3, replacing the url of my repo to yours.

## License
[MIT License](https://github.com/xyr11/xtrike-bot/blob/main/LICENSE)

## Contact
[Join the official support and dev Discord server!](https://discord.gg/x3F22hN)

[@xy_rus](https://twitter.com/xy_rus) on bird app <br>
[Xtrike#<i>0507</i> (id: 681766482304434187)](https://discord.com) on imagine a place

## Credits
Huge thank you to [Worn Off Keys's discord.js playlist](https://www.youtube.com/playlist?list=PLaxxQQak6D_f4Z5DtQo0b1McgjLVHmE8Q), to [the *An Idiot's Guide* guide](https://anidiots.guide/), and finally to [Discord.js Guide](https://discordjs.guide/), especially with the new and spicy v13 stuff. A huge thank also to [Replit](https://replit.com) for the bot hosting.
