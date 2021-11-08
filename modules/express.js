// server
const chalk = require('chalk')
const express = require('express')

module.exports = (() => {
  const app = express()
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Basic alive checker
  app.get('/', (req, res) => {
    res.status(200).send('le alive')
  })

  const port = process.env.PORT || 3000
  app.listen(port, () => {
    console.log(chalk.green('Server is up on port', port, '🚀'))
  })
})()
