## Xtrike Bot Changelog
[Go back to the main thing](./README.md)

### 0.3.1

<details>
<summary>New commands, new year bug fixes and updated discord.js to v13.5.1</summary>

#### Breaking changes
- updated discord.js to v13.5.1
- moved the SendMsg class to its own folder
- new config entry for Oxford Dictionaries API

#### Other stuff
- fixed `extractVids` autoresponse not working
- updated the `user` command to include the presence status and server timeout
- added the `server` command to get all available info on the current server
- forgot to remove the `isBeta` status on the `image` command, command should work now
- added the `define` command which gives word definitions (powered by Oxford Dictionaries)
- recategorized some commands

</details>

### 0.3
<details>
<summary>New commands and command aliases + other stuff</summary>

#### General
- Unified and modularized logger
- Customizable bot name, description, color and `;info` text

Error catching
- Show serialized error object in the console too

Slash commands handler
- Use `interaction.options.data` to get options
- Better `options` parser and support for all 8 option types
- Retry if "Unknown Interaction" error

#### Commands
- Support for command aliases and categories
- Unified and modularized message sender for both `message` and `interaction`
- When a message is deferred (not a slash command) then react to the message so that the user knows that it's been seen

Help
- Show command aliases and their category in the help embed
- Support for aliases and categories as input
- List all commands if there are no inputs

Image search
- Moved autoresponse to its own file
- Check if image has been deleted and remove it
- Use the dominant color of the image as the embed color when displaying search results
- Efficiently fetch image data when fetching images and using the `image` command by using async functions
- Don't save images which does not have any text
- [New schema spec (0.3)](./guides/fetchImage.md) to support new features and fixes below
- Support for multiple attachments in message
- Check if image already exists in the database by checking image links and using image hashes

Info
- Added the bot avatar

message
- Better text parser and help guide

ocr
- Added the `ocr` command to get text from images in attachments or links

Sniper
- Record up to 10 snipes and don't save embed updates

test
- Added more slash commands options for testing

user
- Added the `user` command to get Discord info about a user

ytdl and video
- Dedicated `video` command for extracting videos on platforms `youtube-dl` supports
- added support for specifying video quality
- instead of downloading the video, just use the buffer stream

</details>

### 0.2.1
<details>
<summary>Updates on config file, ytdlVideos, reload, sniper & added some files</summary>

#### General
- Added `PRIVACY.md` and `LICENSE-3RD-PARTY`

Config file
- Accept lowercase activity type
- Fixed `isMobile`

README
- Removed commit hashes because they're too messy
- Added Facebook as supported site and disclaimer for `ytdlVideos`

Error catching
- Fixed `err.stderr` bug that crashes errorCatch
- Updated error catching for `youtube-dl` errors

#### Commands
reload
- Added reloading the presence activity

Sniper
- Fixed channel selector
- Check if given channel is in the same server
- If there are multiple sniped files then attach them in message
- Limiting sniped embeds to only 9

#### Autoresponses
ytdlVideos
- Fixed `output.formats` bug
- Log errors using errorCatch.js
- Detect Facebook links
- `while` loops will not use an extra variable
- Run youtube-dl to each of the links simultaneously
- Remove infinite loop in message sending

</details>

### 0.2
<details>
<summary>Big changes! Re-added and updated many commands, added slash commands, new autoresponses, and switched config settings to config.js</summary>

#### General
- Support for dual command handlers
- Added JSDoc comments for development
- Removed old README.md and integrated it to the current one and added more shields
- Serve http requests for status checking at https://xtrike-bot.xyr11.repl.co/

#### Commands
- Support for dual command handlers, `messageCreate` and `interactionCreate` at the same time!
- `requiredArgs: true`: If a user doesn't give arguments, it will instead give the help embed of that command.
- Never acknowledge the bot's own messages

Help
- Added a "Did you mean" part if there aren't any matches
- Added a `thumbnail` option for the help embed
- Instead of adding the prefix per line, `$$` will now be used instead to substitute the current prefix
- "Options" and "Similar" now has its own embed fields

hmm
- Won't reply to messages anymore (if not a slash command)

Image search
- *New defaults*: It will search for images at most 7 days old and from the current channel only
- Rewrote the schema for more efficient data storage
- Changed how the results are displayed and fixed search parameters for optimal results
- Updated the help embed
- Better link checking
- Automatically retry if script encounters a FetchError

message
- Added the `message` command back

ping
- Removed reliance on custom `pingArea` channel, instead it will just edit its own message

reboot
- Will log to console and change the activity text if bot is rebooting
- Uptime logs will be cleared if `reboot` is run.

sad
- The original `sad` command is added back!

Sniper
- Added `pls snipe`, `editsnipe`, and `reactionsnipe` from [DankMemer/sniper](https://github.com/DankMemer/sniper)
- Added dank mode to support `pls` as a valid prefix
- Data is now stored in the database so that it won't get lost if the bot restarts

stats
- Added stats to get bot commands statistics

test
- More `test` options

uptime
- Added the `uptime` command back. Bot logs the time when it boots up if there are no prior logs. Logs will be cleared if `reboot` is run.

#### Autoresponses
- Modularized autoresponses

hi Autoresponse
- Added back the feature that when every time someone says "hi", the bot wil reply with "hello"

ytdlVideos Autoresponse
- Support for many links in a message
- Default to the lowest quality present

#### Others
Bot config
- Switched all config settings to `config.js`
- Moved all other variables to `modules/base.js`

modules/base.js
- Added more intents and partials
- Removed `botId`
- `hasPerms()`: require the command object instead of just the name

Endpoint
- Added endpoints to get bot statistics

Error catching
- Added filters if and when an error needs to be sent in the error logging channel or be ignored entirely
- Removed last channel tracking
- Added current time as fallback

Statistics
- Get the bot uptime
- Get the number of times the bot executes user commands

<hr></details>

### 0.1.4
<details>
<summary> Fixed bugs in `;image`, added the `;help` command, more settings in `.env`, better error logging </summary>

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

<hr></details>

### 0.1.3
<details>
<summary>Re-added `package-lock.json`, updates to the `image` command, better Replit integration, and more:</summary>

+ Added include/exclude channel in  `image` command
+ Better `image` command replies
+ Better Replit integration in README
+ Updated `info` text
+ Console logging in ping
+ Changed presence activity
+ Added more emojis in `errorCatch.js`

<hr></details>

### 0.1.2
<details>
<summary>Introducing databases and the beta version of the `image` command which finds text in images. Also:</summary>

- added an `env` entry for the timezone
- updated the `.info` part of commands
- moved the 'ready' event to its own file
- added `.replit` file
- added a `Develop` guide in README.md
- added new modules

<hr></details>

### 0.1.0
Rewrite for Discord.js v13 and replaced spaghetti code to an actual command handler. Also, modules, arrow functions, and more Modern Javascript™.

### 0.0.5
<details>
<summary>Changelog</summary>

+ `ping` command will just edit its embed rather than re-sending the message
+ Switched hosting platform from Heroku to Repl.it, modules that aren't needed by Repl.it will not be deleted so that local development of the bot is possible and also because Heroku will be our backup platform
+ Removed the owner ID in the main file (index.js) and placed it in the .env file

<hr></details>

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
<hr></details>

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
<hr></details>

### 0.0.2 and 0.0.1
The bare bones of the bot, with very limited features.
