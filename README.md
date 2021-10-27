# Xtrike Bot (Xtrike#3034)
A multi-purpose discord bot written in discord.js.

![Status](https://img.shields.io/uptimerobot/status/m786499889-6b41061a49e587f762227724?style=flat-square) [![License](https://img.shields.io/github/license/xyr11/xtrike-bot?style=flat-square)](#license) [![on Replit](https://img.shields.io/badge/on-Replit-blue?style=flat-square)](https://replit.com/@xyr11/xtrike-bot)

## License
MIT

## Contact
Xyrus Kurt Roldan - [@xy_rus](https://twitter.com/xy_rus)

## *Thanks for checking out!*

## Notices
> *10/27/2021: I'm back! Also repository will be [rebooted](https://en.wikipedia.org/wiki/The_big_reset_button_in_the_sky).*

> *December 2020 Notice: Main development of the bot has been paused and updates will not be able to flow on a regular basis. But you can still contribute by forking this repo. I also didn't bother to update the wordings in this file, just remember that the development of this bot has been paused.*

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
