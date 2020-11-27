### *The development of the bot has been paused, updates will not flow on a regular basis. The bot will resume its development in the 2nd week of December, but this date is tentative. You can still fork this tho and improve upon it (the [license](https://github.com/xyr11/xtrike-bot/blob/main/LICENSE) still applies), and maybe in the future, I will work on this full-time. I also didn't bother to update the wordings in this file, just remember that the development of this bot has been paused.*

# Xtrike Bot (Xtrike#3034)
A multi-purpose discord bot written in discord.js.

Skip to:

[Version and Changelogs](#versions)

[Contact Links](#contact-links)

## Features
Not much is implememented now, so there still isn't an official release.

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
The bot is hosted on [Repl.it](https://repl.it/~).

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
The barebones of the bot, with very limited features.

No available data

## Contact links
### Xyrus Kurt P. Roldan (owner)
Website: [XYR.codes](https://xyr.codes)

Twitter: [@xy_rus](https://twitter.com/xy_rus)

Discord server: [🎯 Xtrike Now!](https://discord.gg/yTFSQpU)

Other contact links: [xyr.codes/p/contact.html](https://www.xyr.codes/p/contact.html)

### Discord Support and Development Server
Where you can find support about the bot, beta-test versions that the owner is currently working on, or just poke around and discuss about life or something!

Invite link: [discord.gg/x3F22hN](https://discord.gg/x3F22hN)

### *Thanks for checking out!*
