const https = require("https");


const http = {
    getDefinition: (word, callback) => {

        // Our oxford id and key is a .env variable
        const app_id = process.env.OXFORD_ID;
        const app_key = process.env.OXFORD_KEY;
        
        const options = {
            hostname: "od-api.oxforddictionaries.com",
            path: `/api/v2/entries/en-gb/${word}?fields=definitions`,
            headers: {
                app_id,
                app_key
            }
        };
        https.get(options, res => {
            let data = "";

            res.on("data", chunk => {data += chunk;});
  
            res.on("end", () => {http.handleResponse(res.statusCode, data, callback);});
  
            res.on("error", e => {
                callback({
                    status: res.statusCode,
                    message: "There was an error with your request :thinking:",
                    data: {}
                });
            });
        });
    },
    handleResponse: (statusCode, data, callback) => {
        switch (statusCode) {
            case 404:
                callback({
                    status: statusCode,
                    message: "I couldn't find the word you were looking for :cry:",
                    data: {}
                });
            break;
  
            case 200:
                const entry = http._getFirstEntry(data);
  
                callback({
                    status: statusCode,
                    message: "",
                    data: {
                        definition: http._capitaliseDefinition(
                            http._parseDefinition(entry)
                        ),
                    lexicalCategory: http._parseLexicalCategory(entry)
                    }
                });
            break;
  
            default:
                callback({
                status: 403,
                message: "There was an error with your request :thinking:",
                data: {}
            });
        }
    },
    _getFirstEntry: data =>
        JSON.parse(data).results[0].lexicalEntries.find(lex =>
            lex.hasOwnProperty("entries")
        ),
    _parseDefinition: data => data.entries[0].senses[0].definitions[0],
    _parseLexicalCategory: data => data.lexicalCategory.text,
    _capitaliseDefinition: data => data.charAt(0).toUpperCase() + data.slice(1)
  };

  module.exports = http;