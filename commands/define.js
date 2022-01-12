const { MessageEmbed } = require('discord.js')
const fetch = require('node-fetch')
const { oxfordApi } = require('../config')
const { botColor } = require('../modules/base')

exports.info = {
  name: 'define',
  category: 'General',
  description: 'Get word definitions from Oxford Dictionaries',
  usage: '`$$define <word or phrase>`',
  aliases: ['oxford', 'definition'],
  permLevel: 'User',
  requiredArgs: true,
  options: [{ type: 3, name: 'text', description: 'the word or phrase to get definitions', required: true }]
}

// Models from https://developer.oxforddictionaries.com/documentation
/**
 * @typedef {Object} Sense
 * @prop {SynonymsAntonyms} antonyms
 * @prop {[]} constructions
 * @prop {String[]} crossReferenceMarkers
 * @prop {CrossReferencesList} crossReferences
 * @prop {String[]} definitions
 * @prop {domainClassesList} domainClasses
 * @prop {domainsList} domains
 * @prop {String[]} etymologies
 * @prop {{text: String, notes: { text: String, type: String }}[]} examples
 * @prop {string} id
 * @prop {[]} inflections
 * @prop {CategorizedTextList} notes
 * @prop {PronunciationsList} pronunciations
 * @prop {regionsList} regions
 * @prop {{id: String, text: String}[]} registers
 * @prop {{id: String, text: String}[]} semanticClasses
 * @prop {String[]} shortDefinitions
 * @prop {Sense[]} subsenses
 * @prop {{language: String, text: String}[]} synonyms
 * @prop {thesaurusLink[]} thesaurusLinks
 * @prop {VariantFormsList} variantForms
*/
/**
 * @typedef {Object} Entry
 * @prop {String[]} crossReferenceMarkers
 * @prop {CrossReferencesList} crossReferences
 * @prop {String[]} etymologies
 * @prop {GrammaticalFeaturesList} grammaticalFeatures
 * @prop {string} homographNumber
 * @prop {[]} inflections
 * @prop {CategorizedTextList} notes
 * @prop {{phoneticNotation: String, phoneticSpelling: String}[]} pronunciations
 * @prop {Sense[]} senses
 * @prop {VariantFormsList} variantForms
 */
/**
 * @typedef {Object} lexicalEntry
 * @prop {Array} compounds
 * @prop {[]} compounds
 * @prop {[]} derivativeOf
 * @prop {[]} derivatives
 * @prop {Entry[]} entries
 * @prop {GrammaticalFeaturesList} grammaticalFeatures
 * @prop {string} language
 * @prop {{id: String, text: String}} lexicalCategory
 * @prop {CategorizedTextList} notes
 * @prop {[]} phrasalVerbs
 * @prop {{id: String, text: String}[]} phrases
 * @prop {PronunciationsList} pronunciations
 * @prop {string} root
 * @prop {string} text
 * @prop {VariantFormsList} variantForms
 */

const rand = maxNo => Math.floor(Math.random() * maxNo)

/** @param {import('../class/sendMsg')} msg */
exports.run = async msg => {
  // If there are no API keys then ignore command
  if (!oxfordApi || !oxfordApi.length) return

  // Defer
  await msg.setDefer()

  const word = msg.text
  if (!word) return msg.reply("You didn't place any word to define")

  /**
   * @param {String} url
   * @param {Object} reqOptions
   * @param {Number} [retry]
   * @returns {fetch.Response|{err: true, message: Error}}
   */
  const fetcher = async (url, reqOptions = {}, retry = 10) => {
    let response
    for (let i = 0; (i < (retry < 1 ? 10 : retry)) && !response; i++) {
      try {
        response = await fetch(url, reqOptions)
      } catch (err) {
        if (err.name !== 'FetchError') throw err
      }
    }
    return response.json()
  }

  const magicNo = rand(oxfordApi.length)
  // Split the key value and get a random key from the array
  const key = oxfordApi[magicNo].key.split('|').filter(a => a)
  const oxfordAuth = { headers: { app_id: oxfordApi[magicNo].id, app_key: key[rand(key.length)] } }

  // Get lemmas
  /** @type {{ id: String, language: String, lexicalEntries: {inflectionOf: {id: String, text: String}[], language: String, lexicalCategory: {id: String, text: String}, text: String}[], type: String}[]} */
  const oxfordLemmas = await fetcher('https://od-api.oxforddictionaries.com:443/api/v2/lemmas/en/' + word, oxfordAuth).then(res => res.results)
  if (!oxfordLemmas || !oxfordLemmas[0]?.lexicalEntries[0]?.inflectionOf[0]?.text) return msg.reply('Word or phrase cannot be found.')
  const lemmas = oxfordLemmas[0].lexicalEntries[0].inflectionOf[0].text

  // Get word entries
  /** @type {{metadata: Object, results: {id: String, language: String, lexicalEntries: lexicalEntry[], pronunciations: {phoneticNotation: String, phoneticSpelling: String}[], type: String}[], word: String}} */
  const oxfordDef = await fetcher('https://od-api.oxforddictionaries.com:443/api/v2/entries/en-us/' + lemmas, oxfordAuth)
  if (!oxfordDef?.results?.length) return msg.reply('Word or phrase cannot be found.')

  // Create the embeds from the lexicalEntries
  const embeds = []
  /** @type {lexicalEntry[]} */
  const results = oxfordDef.results.reduce((a, b) => [...a, ...b.lexicalEntries], []).slice(0, 10) // limit to 10 only
  for (const result of results) {
    const clean = str => str.toLowerCase().replaceAll('_', ' ')
    /** @type {Sense[]} */
    const defs = result.entries.reduce((a, b) => [...a, ...b.senses], [])

    // Get the phoneticNotation nonsense from 2 layers of arrays don't worry I also don't exactly know how I did this.
    const phonetics = [...new Set(result.entries.reduce((a, b) => [...a, ...b.pronunciations.map(c => { const d = c.phoneticSpelling; return c.phoneticNotation === 'IPA' ? `/${d}/` : d })], []))]

    // Compile all definitions in each lexicalEntry for the description field
    const description = defs.map((a, b, c) =>
      `${c.length > 1 ? `${b + 1}:` : ''}${a?.registers?.length ? ` (${clean(a.registers.map(d => d.text).join(', '))})` : ''} ${a.definitions.join('; ')}${a?.semanticClasses?.length ? ` : ${clean(a.semanticClasses.map(d => d.text).join(', '))}` : ''}` +
      (a?.examples?.length ? a.examples.map(d => d.text && `\n • ${d?.notes?.text ? `(${d?.notes?.text}) ` : ''}"${d.text.replace(/^\s+|\s+$/g, '')}"`).filter(a => a).join('') : '')) // eslint-disable-line no-irregular-whitespace

    // Compile synonyms
    const synonyms = defs.map((a, b, c) => (a?.synonyms?.length ? (c.length > 1 ? `(${b + 1}): ` : '') + a.synonyms.map(d => d.text).join(', ') : '')).filter(a => a)

    // The embed
    const embed = new MessageEmbed()
      .setTitle(`${oxfordDef.word}${phonetics.length ? ` (${phonetics.join(', ')})` : ''}: [${clean(result.lexicalCategory.text)}]`)
      .setDescription(description.join('\n\n'))
      .setColor(botColor)
    if (synonyms.length) embed.addField('Synonyms', synonyms.join('\n'))
    if (result.entries[0].etymologies) embed.addField('Etymology', result.entries[0].etymologies.join(', '))
    if (result?.phrases?.length) embed.addField('Phrases', result.phrases.map(a => `• ${a.text}`).slice(0, 6).join('\n')) // max number is 6 phrases
    // Push to embeds array
    embeds.push(embed)
  }
  // Reply embeds
  msg.reply({ embeds })
}
