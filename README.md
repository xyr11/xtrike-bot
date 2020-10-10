# Xtrike Bot (@Xtrike#3034)
A multi-purpose discord bot written in discord.js.

**Quick links for pro users**: [Version and Changelogs](#version)

## Features
Not much is implememented now, so there still isn't an official release.

The current features are: (it might be a little disappointing at this moment)

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
(To be implemented)

+ subject
+ reqs
+ play
+ execute
+ timer
+ clock
+ oxford (currently on development, uses the [Oxford Dictionary API](https://developer.oxforddictionaries.com))

## Technical info

### Hosted on
The bot is hosted on [Heroku](https://heroku.com "heroku.com") with the "Free" account. (I'm justs a poor guy, y'know?)

### Programming languages and modules used
[Node.js](https://www.google.com/search?q=node.js "Search on Google") ([Javascript](https://www.google.com/search?q=javascript "Search on Google"))

Modules: discord.js, express

## Version
Alpha 0.4 (Not **yet** official)

### Alpha 0.4

#### Changelogs
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

#### Known Bugs
+ Custom status resetting (probably after app restart on heroku)
+ Message command doesn't display anything when first input is endline, e.g. `;msg <next line>Hi!`
+ Uptime command resetting ([see in Issues](https://github.com/xyr11/xtrike-bot/issues/5))

### Alpha 0.3

#### Changelog
```diff
+ Fixed echo command that crashes the bot after not mentioning someone
+ Added "no-sleep", "restart", "hmm" commands
+ Added "sad", "uptime", and "restart" as beta commands
+ Added all commands with its corresponding 'help' guides (e.g. ;ping help)
+ Added a new update naming system
- Removed "hmm" command from beta commands to be an official command
- No-sleep command deprecated
```

## Contact me
Twitter: [@xy_rus](https://twitter.com/xy_rus)

Discord *Support* Server: [discord.gg/yTFSQpU](https://discord.gg/yTFSQpU)

Thanks for checking out!

A Tutorial for making Discord bots using `discord.js`? [Visit this!](https://www.youtube.com/watch?v=dQw4w9WgXcQ "Not yet finished")
