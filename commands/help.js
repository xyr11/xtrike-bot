const { getUserPerms, hasPerms } = require('../config')

exports.info = {
  name: 'help',
  category: 'Info',
  description: 'Show the description of all commands of the bot.',
  usage: 'help <command name/alias>',
  aliases: ['help'],
  permLevel: 'User',
  isBeta: true
}

exports.run = (client, message, args) => {
  // debug
  if (args.length === 1 && args[0] === 'debug' && getUserPerms(message) >= 4) {
    message.reply('```' + JSON.stringify(client.commands) + '```')
  }

  // get the help command of the help command itself
  if (!args) {
    // todo: ye

    return
  }

  // if there are args, get the first argument and search it up in commands list
  const cmd = client.commands.get(args[0])

  // if that command doesn't exist, silently exit and do nothing
  // if they dont have proper permLevels, do nothing too
  // todo: if that command doesn't exist, say that that command doesn't exist / add those "did you mean x?" stuff in the future
  if (!cmd || !hasPerms(cmd.info.permLevel, message)) {
    // stuff

    return
  }

  // todo: if that command exist, check if they *should* see the command or not (for reserved commands like restart, reload, etc)

  // todo: if they have proper permLevels, display the cmd.info stuff
  message.channel.send(cmd)
}
