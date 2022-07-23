/**
 * Inspired by https://github.com/AnIdiotsGuide/guidebot (commands/reboot.js)
 *
 * MIT License
 *
 * Copyright (c) 2018 YorkAARGH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const BotCmd = require('../class/botCmd')

module.exports = new BotCmd('reboot')
  .setCategory('Developer')
  .setDescription('Reboot')
  .setUsage('`$$reboot`')
  .requiredPerm('lmao')
  .callback(async msg => {
    const { presence } = require('../modules/base')
    const { storeInfo } = require('../modules/botInfo')

    const { client } = msg

    // Log to console
    msg.urgent('Bot is shutting down. 🤖')

    // Set activity
    await client.user.setActivity('none. Rebooting...', { type: presence.activityType })

    // Reply
    await msg.reply('Bot is shutting down.')

    // Remove upSince
    await storeInfo('upSince', null)

    await Promise.all(client.commands.map(cmd => {
      // The path is relative to the current folder, so just ./filename.js
      delete require.cache[require.resolve(`./${cmd.info.name}.js`)]
      // We also need to delete and reload the command from the container.commands Enmap
      return client.commands.delete(cmd.info.name)
    }))

    // Exit
    process.exit(0)
  })
