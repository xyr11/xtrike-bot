'use strict';

// dotenv for local .env files
require('dotenv').config();

// discord.js
const { Client, MessageEmbed } = require("discord.js");
const client = new Client();

// express for heroku ports
const express = require('express');
const app = express();

const utility = require("./utility").default;

// Bot prefix, may change location in the future
const prefix = ";";

// Record the bot owner's id so that owner can do owner commands
const ownerID = '681766482304434187';

// Hex Colors
const botCo = "#77e4ff"; // bot theme/main color, electric blue
const redCo = "#f04848"; // red
const grnCo = "#44b37f";

// List of commands
// May change location in the future
var commandList = {
	"hmmm": ["hmm", "hmmmmmm", "hmmm"],
	"online": ["online", "on", "active"],
	"echo": ["echo", "repeat"],
	"sad": ["sad", "(", "'("],
	"message": ["message", "messages", "msg"],
	"ping": ["ping", "latency", "speed", "network"],
	"uptime": ["uptime", "runtime"],
	"help": ["help", "commands"],
	"info": ["info", "bot", "botinfo", "xtrikebot"],
	"oxford": ["oxford"]
};
var commandTypes = {
	"misc": ["hmmm", "online", "echo", "sad", "message"],
	"bot": ["ping", "uptime", "help", "info"],
	"unfinished": ["subject", "reqs", "play", "execute", "timer", "clock", "oxford"]
};

// set to var so that it can be editable
var activityDisplay = `${prefix}help | ${prefix}info`;

app.set('port', (process.env.PORT || 5000));

// Record login on console
client.on('ready', () => {
	console.log(`Logged in successfully as ${client.user.tag}!`);
	client.user.setActivity(activityDisplay, { type: "LISTENING"});
});

// http://bit.ly/xyrimg for orig image avatar

// Detect if user messaged guild
client.on("message", function(message) {

	// If message came from a fellow bot, ignore it
	if (message.author.bot) return;

	// Variables
	// ! will delete this
	var userNameCall = message.author.tag;
	var userIDCall = message.author;
	var serverName = message.guild.name;
	var allMentions = message.mentions.users.array();

	// Embed Vars
	var helpEmbed = {color: botCo};

	const http = utility;

//	MENTIONED @XTRIKE#3034 AS FIRST WORD
//!	Not fixed yet
//	const tempArgs = message.content.split(/ +/);
//	if (typeof allMentions[0] !== 'undefined') {
//		if(allMentions[0].id === tempArgs[0].id) {
//			message.channel.send(`Did you just mentioned me? :shrug: \nIf you are meant to get help, type in \`${prefix}help\`.`);
//		}
//	}

	// if a user messaged "hi"
	if (message.content === "hi") {
		message.channel.send(`hello ${userIDCall}`);
	}

	// Filters
	if (!message.content.startsWith(prefix)) return;

	// Get command from user input
	const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(/ +/);
	const command = args.shift().toLowerCase();

	// COMMANDS

	// Detect if user inputs a command that is still a beta/planned/nonexisting command
	if (commandTypes.unfinished.indexOf(command) >= 0) {
		if(message.author.id !== ownerID) {
			var unfinishedEmbed = {title: ":warning: Error"};
			unfinishedEmbed.color = redCo;
			unfinishedEmbed.description = "This command is still in the works.\nCheck back later!";
			unfinishedEmbed.footer = {text: `You can explore other commands with ${prefix}commands.`};
			message.channel.send({embed: unfinishedEmbed}).then(m => {
				m.delete({ timeout: 5000 }).catch(console.error);;
			});
			return message.delete({ timeout: 5000 }).catch(console.error);
		}
	}

	// Oxford
	if (commandList.oxford.indexOf(command) >= 0) { // oxford command
		// configure the embed
		var oxfordEmbed = {color: "#0053b3"};

		if (args.length > 0) {
			// set user input into one string with spaces
			var wordAll = args[0];
			for (var i=1; i < args.length; i++) {
				wordAll += " " + args[i];
			}
			
			// inform user that bot has started finding definitions
			message.channel.send({embed: {color: "#0053b3", description: `Getting the definition of \`${wordAll}\`...`}}).then( m => {
				// configure the embed
				
				// send the embed
				m.channel.send({embed: oxfordEmbed});
				// delete the first message
				return m.delete();
			});

		/*	http.getDefinition(wordAll, ({ data = {}, defineMsg = `Error ${status}`, status }) => {
				if (status === 404) {
					message.channel.send(defineMsg);
					return;
				}
				if (status === 200) {
					let wordField = {
						name: `${wordAll} - ${data.lexicalCategory}`,
						value: data.speech
					};
					let definitionField = {
						name: 'Definition',
						value: data.definition
					};
					botEmbed.title = `${wordAll}`;
					botEmbed.fields = [definitionField];
					message.channel.send({ embed: botEmbed });
				} else {
					message.channel.send(defineMsg);
				}
			}); */
		} else {
			oxfordEmbed.title = ":warning: Error";
			oxfordEmbed.color = redCo;
			oxfordEmbed.description = "Please specify the word you would like to define!";
			message.channel.send({embed: oxfordEmbed}).then(m => {
				m.delete({ timeout: 5000 }).catch(console.error);;
			});
			return message.delete({ timeout: 5000 }).catch(console.error);
		}
	} else if (commandList.ping.indexOf(command) >= 0) { // ping command
		if(args[0] === "help") {
			helpEmbed.title = 'Ping command help';
			helpEmbed.description = `Get the bot's ping. \n \nCommand: \`${prefix}ping\``;
			helpEmbed.fields = {name: 'Other names', value: `\`${commandList.ping.join('`, `')}\``};
			return message.channel.send({embed: helpEmbed}).catch(console.error);
		}
		var pingEmbed = {color: redCo, title: 'Pinging...'};
		message.channel.send({embed: pingEmbed}).then(m =>{
			// compute for ping
            var ping = m.createdTimestamp - message.createdTimestamp;
			var botPing = Math.round(client.ws.ping);
			// modify pingEmbed
			pingEmbed.title = ':ping_pong: Ping Pong!';
			pingEmbed.description = `The bot's latency is: **${ping}ms**. \nAPI latency is: **${botPing}ms**.`;
			// edit embed
			m.edit({embed: pingEmbed});
		});
	} else if (commandList.uptime.indexOf(command) >= 0) { // uptime command
		if (args[0] === "help") {
			helpEmbed.title = 'Uptime command help';
			helpEmbed.description = `Get how long the bot has been running. \n \nCommand: \`${prefix}uptime\``;
			helpEmbed.fields = {name: 'Other names', value: `\`${commandList.uptime.join('`, `')}\``};
			return message.channel.send({embed: helpEmbed}).catch(console.error);
		}
		var uptimeEmbed = {title: ":green_circle: Bot Uptime", color: grnCo};
		
		// Solve the variables to its corresponding unit of time
		var uptimeSecs = Math.floor(client.uptime % (1000 * 60) / 1000);
		var uptimeMins = Math.floor(client.uptime % (1000 * 60 * 60) / (1000 * 60));
		var uptimeHrs  = Math.floor(client.uptime % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
		var uptimeDays = Math.floor(client.uptime % (1000 * 60 * 60 * 24 * 365) / (1000 * 60 * 60 * 24));
		var uptimeYrs  = Math.floor(client.uptime / (1000 * 60 * 60 * 24 * 365));

		// Set the value of the string
		var uptimeDisplay = `${uptimeSecs}s`;
		// only show (or in this case, add) the value if it is not zero
		// e.g. 0y 123d 0h 0m 45.6s becomes 123d 45s
		if (uptimeMins !== 0) uptimeDisplay = `${uptimeMins}m ` + uptimeDisplay;
		if (uptimeHrs !== 0)  uptimeDisplay = `${uptimeHrs}h ` + uptimeDisplay;
		if (uptimeDays !== 0) uptimeDisplay = `${uptimeDays}d ` + uptimeDisplay;
		if (uptimeYrs !== 0)  uptimeDisplay = `${uptimeYrs}y ` + uptimeDisplay;

		// edit the embed var
		uptimeEmbed.description = `Bot uptime after updating: **${uptimeDisplay}**`;
		uptimeEmbed.timestamp = Date.now() - client.uptime;
		uptimeEmbed.footer = {text: "Last update is"};

		// send the embed
		return message.channel.send({ embed: uptimeEmbed });
	} else if (commandList.info.indexOf(command) >= 0) { // info command
		if(args[0] === "help") {
			helpEmbed.title = 'Info command help';
			helpEmbed.description = `Used to say the information about the bot. \n \nCommand: \`${prefix}info\``;
			helpEmbed.fields = {name: 'Other names', value: `\`${commandList.info.join('`, `')}\``};
			return message.channel.send({embed: helpEmbed}).catch(console.error);
		}
		// INFO EMBED
		const infoEmbed = {color: botCo};
		infoEmbed.title = 'Xtrike Bot 0.3 (Alpha)';
		infoEmbed.description = `Xtrike Bot is a multi-purpose bot. \nIt is currently under development of <@681766482304434187>.`;
		infoEmbed.fields = {name: `:tools: Version 0.4 (alpha) `, value: `More features coming soon!`};
		infoEmbed.fields = {name: `Commands`, value: `Prefix: \`${prefix}\` \nFor commands, type \`${prefix}commands\`.`};
		return message.channel.send(infoEmbed);
	} else if (commandList.echo.indexOf(command) >= 0) { // echo command
		if (args[0] === "help") {
			helpEmbed.title = 'Echo command help';
			helpEmbed.description = `Used to echo some text. \n \nCommand: \`${prefix}echo <text>\``;
			helpEmbed.fields = {name: 'Other names', value: `\`${commandList.echo.join('`, `')}\``};
			return message.channel.send({embed: helpEmbed}).catch(console.error);
		} else if (!args.length) {
			return message.channel.send(`Hey ${userIDCall}, you didn't provide any text to be echoed lol.`);
		}
		var echoEmbed;
		if (args[0] === "pro") {
			message.delete();
			args.shift();
			// EMBED
			var echoEmbed = new MessageEmbed()
				.setColor(botCo)
				.setTitle('🔊 Echo...')
				.setDescription(`${args}`)
				.addField('The `args` variable', `All \`args\` related variables. \`args\` values are the user input after every command.`)
				.addFields(
					{name: '`args`', value: `${args}`, inline: true},
					{name: '`args` (raw)', value: `\`${args}\``, inline: true},
					{name: '`args.length`', value: `${args.length}`, inline: true},
					{name: '`args[0]`', value: `${args[0]}`, inline: true},
					{name: '`args[0].id`', value: `${args[0].id}`, inline: true},
				)
				.addField('Message sources/authors', `All \`message.author.<blank>\` related.`)
				.addFields(
					{name: '`message.author`', value: `${message.author}`, inline: true},
					{name: '`message.author` (raw)', value: `\`${message.author}\``, inline: true},
					{name: '`message.author.id`', value: `${message.author.id}`, inline: true},
					{name: '`message.author.tag`', value: `${message.author.tag}`, inline: true},
				)
				.addField('The `allMentions` variable', `Variable for \`message.mentions.users.array()\`.`)
				.addFields(
					{name: '`allMentions`', value: `${allMentions}\u200b`, inline: true},
					{name: '`allMentions[0]`', value: `${allMentions[0]}\u200b`, inline: true},
//!	Crashes the bot	{name: '`allMentions[0].id`', value: `${allMentions[0].id}`, inline: true}, 
				)
				.addField('Other useful info', `See for yourself.`)
				.addFields(
					{name: '`message.guild.name`', value: `${message.guild.name}\u200b`, inline: true},
					{name: '`message.mentions.users.size`', value: `${message.mentions.users.size}\u200b`, inline: true},
				);
		} else {
			var echoEmbed = new MessageEmbed()
				.setColor(botCo)
				.setTitle(`🔊 ${message.author.tag} said`)
				.setDescription(`${args}`);
		}
		return message.channel.send(echoEmbed).catch(console.error);
	} else if (commandList.sad.indexOf(command) >= 0) { // sad command
		if (args[0] === "help") {
			helpEmbed.title = 'Sad comamnd help';
			helpEmbed.description = `Let <@748386919460765706> cheer you if you're sad! \n \nCommand: \`${prefix}sad\``;
			helpEmbed.fields = {name: 'Other names', value: `\`${commandList.sad.join('`, `')}\``};
			return message.channel.send({embed: helpEmbed}).catch(console.error);
		}
		message.channel.send(`Hey ${userIDCall}, there's no room to be sad. Cheering on you through the hard times! <3`);
	} else if (commandList.online.indexOf(command) >= 0) { // online command
		if (args[0] === "help") {
			helpEmbed.title = 'Online comamnd help';
			helpEmbed.description = `Used to determine the number of online members. \n \nCommand: \`${prefix}online\``;
			helpEmbed.fields = {name: 'Other names', value: `\`${commandList.online.join('`, `')}\``};
			return message.channel.send({embed: helpEmbed}).catch(console.error);
		}
		message.guild.members.fetch().then(fetchedMembers => {
			const statusTypes = ['online', 'idle', 'dnd'];
			var totalOnline = fetchedMembers.filter(m => statusTypes.indexOf(m.presence.status) >= 0).size;
			const onlineEmbed = new MessageEmbed()
				.setColor('#44b37f')
				.setTitle(':green_circle: Online Members')
				.setDescription(`There are currently **${totalOnline}** members online \nin ${message.guild.name}`)
				.setTimestamp();
			return message.channel.send(onlineEmbed);
		});
	} else if (commandList.message.indexOf(command) >= 0) { // message command
		if(args[0] === "help") {
			helpEmbed.title = 'Message comamnd help';
			helpEmbed.description = `Used to create a message in the form of an embed. \n \nCommand: \`${prefix}message\``;
			helpEmbed.fields = {name: 'Other names', value: `\`${commandList.message.join('`, `')}\``};
			return message.channel.send({embed: helpEmbed}).catch(console.error);
		}
		if ((!args.length) || (args[0] === allMentions[0] && args<=1)) {
			return message.channel.send(`Hey ${userIDCall}, you didn't provide any text to be messaged lol.`);
		}
		var messageInputLength = args.length;
		var messageInputAll = "";
		var messageEmbed;
		const messageToUser = message.mentions.users.first();
		if (args.length > 1 && args[0] === allMentions[0]){
			messageInputLength--;
		}
		for (var i=0; i < messageInputLength; i++) {
			messageInputAll += args[i] + " ";
		}
		if (args.length > 1 && args[0] === allMentions[0]) {
			messageEmbed = new MessageEmbed()
				.setColor(botCo)
				.setTitle('Message to ${args[0]}')
				.setDescription(`${messageInputAll}`)
				.setTimestamp()
				.setFooter(`${message.author.tag}`, `${message.author.avatarURL}`);
		} else {
			messageEmbed = new MessageEmbed()
				.setColor(botCo)
				.setTitle('Message')
				.setDescription(`${messageInputAll}`)
				.setTimestamp()
				.setFooter(`${message.author.tag}`, `${message.author.displayAvatarURL({ format: "png", dynamic: true })}`);
		}
		message.delete()
			.catch(console.error);
		message.channel.send(messageEmbed);
	} else if (command === "pls") { // pls command (easter egg!)
		message.channel.send(`Hey ${userIDCall}, there isn't supposed to be a \`${prefix}\` before \`pls\`. Try again.`)
		.then(msg => {
			msg.delete({ timeout: 5000 }).catch(console.error)
		 });
		 message.delete({ timeout: 5000 }).catch(console.error);
	} else if (commandList.hmmm.indexOf(command) >= 0) { // hmm command
		if(args[0] === "help") {
			helpEmbed.title = 'Hmmm comamnd help';
			helpEmbed.description = `Used to reply "hmm..." to the user \n \nCommand: \`${prefix}hmm\``;
			helpEmbed.fields = {name: 'Other names', value: `\`${commandList.hmmm.join('`, `')}\``};
			return message.channel.send({embed: helpEmbed}).catch(console.error);
		}
		message.delete().catch(console.error);
		if(!args.length) {
			message.channel.send(`${userIDCall} hmmmmmm... :thinking:`);
		} else {
			message.channel.send(`${args} hmmmmmm... :thinking:`);
		}
	} else if (commandList.help.indexOf(command) >= 0) { // help command
		if (!args.length) {
			helpEmbed.title = 'Xtrike Bot Commands'
			helpEmbed.description = `Syntax: \`${prefix}help <section>\``
			helpEmbed.fields = [
				{name: ':chart_with_upwards_trend: Upcoming', value: `\`${prefix}help up\``, inline: true},
				{name: ':game_die: Miscellaneous', value: `\`${prefix}help misc\``, inline: true},
				{name: ':tools: Bot', value: `\`${prefix}help bot\``, inline: true}
			];
			helpEmbed.footer = {text: '⚠ Currently under development'};
		}
		var helpTypes = ["up", "misc", "bot"];
		if (args[0] === "up") {
			helpEmbed.title = ':chart_with_upwards_trend: Upcoming Commands';
			helpEmbed.description = `These are the commands that you can expect to be implemented in the future! \nSyntax: \`${prefix}<command> help\``;
			helpEmbed.fields = {name: 'Commands:', value: `\`${commandTypes.unfinished.join('`, `')}\` and more... :thinking:`};
			helpEmbed.footer = {text: '⚠ Currently under development'};
		} else if (args[0] === "misc") {
			helpEmbed.title = ':game_die: Miscellaneous Commands';
			helpEmbed.description = `You read the title. \nSyntax: \`${prefix}<command> help\``;
			helpEmbed.fields = {name: 'Commands:', value: `\`${commandTypes.misc.join('`, `')}\``};
			helpEmbed.footer = {text: 'On the process of adding more...'};
		} else if (args[0] === "bot") {
			helpEmbed.title = ':tools: Bot Commands';
			helpEmbed.description = `Commands that can be used related to me. \nSyntax: \`${prefix}<command> help\``;
			helpEmbed.fields = {name: 'Commands:', value: `\`${commandTypes.bot.join('`, `')}\``};
			helpEmbed.footer = {text: 'You can suggest more on #code-suggestions!'};
		}
		if(!args.length || helpTypes.indexOf(args[0]) >= 0)
			return message.channel.send({embed: helpEmbed}).catch(console.error);
	}
});

client.on('shardError', error => {
	 console.error('A websocket connection encountered an error:', error);
});

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});


client.login(process.env.DISCORD_TOKEN);
//client.user.setActivity(activityDisplay, { type: "LISTENING"});