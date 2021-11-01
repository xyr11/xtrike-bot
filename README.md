# Xtrike Bot
A multi-purpose discord bot written in [discord.js](https://discord.js.org).

[![Status](https://img.shields.io/uptimerobot/status/m786499889-6b41061a49e587f762227724)](https://replit.com/@xyr11/xtrike-bot) [![License](https://img.shields.io/github/license/xyr11/xtrike-bot)](#license)

## Versions

### 0.1.3
Re-added `package-lock.json`, updates to the `image` command, better Replit integration, and more:
+ Added include/exclude channel in  `image` command
+ Better `image` command replies
+ Better Replit integration in README
+ Updated `info` text
+ Console logging in ping
+ Changed presence activity
+ Added more emojis in `errorCatch.js`

### 0.1.2
Introducing databases and the beta version of the `image` command which finds text in images. Also:
- added an `env` entry for the timezone
- updated the `.info` part of commands
- moved the 'ready' event to its own file
- added `.replit` file
- added a `Develop` guide in README.md
- added new modules

### 0.1.0
Rewrite for Discord.js v13 and replaced spaghetti code to an actual command handler. Also, modules, arrow functions, and more Modern Javascript™.

### 0.0.1-0.0.5
*(Previously known as "Alpha 0.1" to "Alpha 0.5")*

All Discord.js pre-v13 code.

## Develop

### Prerequisites
+ [Git](https://git-scm.com/downloads)
+ [Node.js 16.6 or later (preferably the latest version)](https://nodejs.org/en/download/)
+ [a MongoDB database](https://www.mongodb.com/)
+ [an OCRSpace API key](https://ocr.space/ocrapi)
+ [Replit account (optional)](https://replit.com)

### Configure repository
1. *If you're using Replit*, click the big gray button: [![on Replit](https://replit.com/badge/github/xyr11/xtrike-bot)](https://replit.com/github/xyr11/xtrike-bot). After that, go to the "Shell" tab and enter `npm test` to install Node 16.

   *If not*, then clone the repository via Git
   ```
   cd "C:/Path/of/folder/you/want/this/repo/to/go"
   git clone https://github.com/xyr11/xtrike-bot.git && cd xtrike-bot && npm i
   ```

2. *If you're using Replit*, add the keys and values in the System Environmental Variables part, following the naming scheme of the keys below [(see the Replit docs for more info)](https://docs.replit.com/programming-ide/storing-sensitive-information-environment-variables).

   *If not*, then create a `.env` file, copy the stuff below and replace the values with the actual value
   ```
   # If you want to customize the timezone that will be shown in logs then add a valid 'TZ database name' below (https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
   TIMEZONE=Antarctica/South_Pole
   DISCORD_TOKEN=your-discord-token
   CLIENT_ID=your-discord-client-id
   MONGO_URI=your-mongo-db-uri
   OCRSPACE_KEY=your-ocrspace-key
   ```

### Run repository
*If you're on Replit*, press the big "Run" button. *If not*, enter the following:
```
npm start
```
If no errors are encountered, you will be able to see this message:
```
Ready as <Bot username>! (<Date and time>) 🤖
```

### Updating local copy (for Git)
[**NOTE: This will overwrite all files that are updated, so you will lose all changes.** Files you created, like for example `betterIndex.js`, will *not* be affected *unless* the latest commit has a `betterIndex.js` file in the same location.]

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
Huge thank you to [the *How To Make a Discord Bot With Discord.JS v13* playlist by Worn Off Keys](https://www.youtube.com/playlist?list=PLaxxQQak6D_f4Z5DtQo0b1McgjLVHmE8Q), to [the *An Idiot's Guide* guide](https://anidiots.guide/), and finally to [Discord.js Guide](https://discordjs.guide/), especially with the new and spicy v13 stuff.

## Notices
> *10/27/2021: I'm back! Also repository will be [rebooted](https://en.wikipedia.org/wiki/The_big_reset_button_in_the_sky).*

> *December 2020 Notice: Main development of the bot has been paused and updates will not be able to flow on a regular basis. But you can still contribute by forking this repo. I also didn't bother to update the wordings in this file, just remember that the development of this bot has been paused.*

<br>
<details>
<summary>Old README.md</summary>

## Features
Not much is implemented now, so there still isn't an official release.

Current features:
+ Checks how many are offline
+ Creates a "message" embed
+ Other stuff for fancy purposes only

### List of Commands
+ `online`
+ `hmm`
+ `echo`
+ `sad`
+ `message`
+ `ping`
+ `uptime`
+ `help`

#### Planned commands

+ subject
+ reqs
+ play
+ execute
+ timer
+ clock
+ oxford

## Technical info

### Hosted on
The bot is *now* hosted on [Repl.it](https://repl.it/~).

### Programming language
[Node.js](https://www.google.com/search?q=node.js "Search on Google") ([Javascript](https://www.google.com/search?q=javascript "Search on Google"))

Modules: discord.js

## Versions

### Alpha 0.5
*currently been working*

Visit the [official Discord support and Development server](#discord-support-and-development-server) to see its progress!

#### Planned Features
+  swearing auto-filter

#### Planned Fixes
+ [Uptime command display resetting #5](https://github.com/xyr11/xtrike-bot/issues/5 "See in Issues")
+ [Custom status resetting #7](https://github.com/xyr11/xtrike-bot/issues/7 "See in Issues")
+ [Add the command in error messages #4](https://github.com/xyr11/xtrike-bot/issues/4 "See in Issues")
+ [Info command not working #8](https://github.com/xyr11/xtrike-bot/issues/8 "See in Issues")


### Build-01 for Alpha 0.5
*the current, live version*

#### What's New
+ `ping` command will just edit its embed rather than re-sending the message
+ Switched hosting platform from Heroku to Repl.it, modules that aren't needed by Repl.it will not be deleted so that local development of the bot is possible and also because Heroku will be our backup platform
+ Removed the owner ID in the main file (index.js) and placed it in the .env file

[Current Issues](https://github.com/xyr11/xtrike-bot/issues "See in Issues")


### Alpha 0.4

#### What's New
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

[Current Issues](https://github.com/xyr11/xtrike-bot/issues "See in Issues")


### Alpha 0.3

#### What's New
```diff
+ Fixed echo command that crashes the bot after not mentioning someone
+ Added "no-sleep", "restart", "hmm" commands
+ Added "sad", "uptime", and "restart" as beta commands
+ Added all commands with its corresponding 'help' guides (e.g. ;ping help)
+ Added a new update naming system
- Removed "hmm" command from beta commands to be an official command
- No-sleep command deprecated
```

### Alpha 0.2 and 0.1
The bare bones of the bot, with very limited features.

No available data

</details>
