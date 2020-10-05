'use strict';

require('dotenv').config();

const { Client, MessageEmbed } = require("discord.js");
const client = new Client();
const express = require('express');
const app = express();

const prefix = ";";
const ownerID = 681766482304434187;
const botAuthor = "<@748386919460765706>";

app.set('port', (process.env.PORT || 5000));

//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
    var result = 'App is running'
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running, server is listening on port', app.get('port'));
});

client.on('ready', () => {
	console.log(`Logged in successfully as ${client.user.tag}!`);
	client.user.setActivity(`${prefix}help | ${prefix}info`, { type: "LISTENING"});
});

// variables
var subjFilled = 0;
var subjName = new Array(16);

// http://bit.ly/xyrimg for orig image avatar

// HELP EMBED
const helpEmbed = new MessageEmbed()
	.setColor('#77e4ff')
	.setTitle('Xtrike Bot Commands')
	.setDescription(`Syntax: \`${prefix}help <section>\``)
	.addFields(
		{name: ':chart_with_upwards_trend: Upcoming', value: `\`${prefix}help up\``, inline: true},
		{name: ':game_die: Miscellaneous', value: `\`${prefix}help misc\``, inline: true},
		{name: ':tools: Bot', value: `\`${prefix}help bot\``, inline: true},
	)
	.setFooter('⚠ Currently under development');

client.on("message", function(message) {
	if (message.author.bot) return;
	// Variables
	var userNameCall = message.author.tag;
	var userIDCall = message.author;
	var serverName = message.guild.name;
	var allMentions = message.mentions.users.array();
//	MENTIONED @XTRIKE#3034 AS FIRST WORD
	const tempArgs = message.content.split(/ +/);
	if (typeof allMentions[0] !== 'undefined') {
		if(allMentions[0].id === tempArgs[0].id) {
			message.channel.send(`Did you just mentioned me? :shrug: \nIf you are meant to get help, type in \`${prefix}help\`.`);
		}
	}
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
// ------------------------ PING ------------------------
	if (command === "ping" || command === "latency" || command === "speed" || command === "network") {
		if(args[0] === "help") {
			const pingHelp = new MessageEmbed()
				.setColor('#77e4ff')
				.setTitle('Ping command help')
				.setDescription(`Get the bot's ping. \n \nCommand: \`${prefix}ping\``)
				.addField('Other names', '`ping`, `latency`, `speed`, `network`'); 
			return message.channel.send(pingHelp);
		}
		const pingingEmbed = new MessageEmbed()
			.setColor('#f04848')
			.setTitle('Pinging...')
			.setFooter(`Requested by ${userNameCall}`,`${message.author.displayAvatarURL({ format: "png", dynamic: true })}`);
		message.channel.send(pingingEmbed).then(m =>{
            var ping = m.createdTimestamp - message.createdTimestamp;
            var botPing = Math.round(client.pi);
			const pingfEmbed = new MessageEmbed()
				.setColor('#f04848')
				.setTitle(':ping_pong: Ping Pong!')
				.setDescription(`The bot's ping is: **${ping}ms**.`)
				.setTimestamp()
				.setFooter('Xtrike Bot', `${client.user.displayAvatarURL({ format: "png", dynamic: true })}`);
			return m.edit(pingfEmbed);
		});
	}
// ------------------------ CLIENT UPTIME ------------------------
	else if (command === "uptime") {
		return message.channel.send(`Bot uptime: ${client.uptime}ms`);
	}
// ------------------------ INFO ------------------------
	else if (command === "info" || command === "bot" || command === "botinfo" || command === "xtrikebot") {
		if(args[0] === "help") {
			const infoHelp = new MessageEmbed()
				.setColor('#77e4ff')
				.setTitle('Info command help')
				.setDescription(`Used to say the information about the bot. \n \nCommand: \`${prefix}owner\``)
				.addField('Other names', '`info`, `bot`, `botinfo`, `xtrikebot`'); 
			return message.channel.send(infoHelp);
		}
		// INFO EMBED
		const infoEmbed = new MessageEmbed()
			.setColor('#77e4ff')
			.setTitle('Xtrike Bot 0.3 (Alpha)')
			.setDescription(`Xtrike Bot is a multi-purpose bot. \nIt is currently under development of <@681766482304434187>.`)
			.addField(`:tools: Version 0.3 (alpha) `, `More features coming soon!`)
			.addField(`Commands`, `Prefix: \`${prefix}\` \nFor commands, type \`${prefix}commands\`.`)
			.setFooter('@Xtrike#3034', `${client.user.displayAvatarURL({ format: "png", dynamic: true })}`);
		message.channel.send(infoEmbed);
	}
// ------------------------ HELP ------------------------
	else if (command === "help" | command === "commands") {
		if (!args.length) {
			return message.channel.send(helpEmbed);
		}
		var helpEmbeds;
		if (args[0] === "up") {
			helpEmbeds = new MessageEmbed()
				.setColor('#77e4ff')
				.setTitle(':chart_with_upwards_trend: Upcoming Commands')
				.setDescription(`These are the commands that you can expect to be implemented in the future! \nSyntax: \`${prefix}<command> help\``)
				.addField('Commands:', '`subject`, `reqs`, `play`, `execute`, `timer`, `clock` and more... <:thonking:759407890158190622>')
			.setFooter('⚠ Currently under development');
		} else if (args[0] === "misc") {
			helpEmbeds = new MessageEmbed()
				.setColor('#77e4ff')
				.setTitle(':game_die: Miscellaneous Commands')
				.setDescription(`You read the title. \nSyntax: \`${prefix}<command> help\``)
				.addField('Commands:', '`hmmm`, `online`, `echo`, `owner`, `sad`')
				.setFooter('On the process of adding more...');
		} else if (args[0] === "bot") {
			helpEmbeds = new MessageEmbed()
				.setColor('#77e4ff')
				.setTitle(':tools: Bot Commands')
				.setDescription(`Commands that can be used related to me. \nSyntax: \`${prefix}<command> help\``)
				.addField('Commands:', '`ping`, `help`, `info`')
				.setFooter('You can suggest more on #code-suggestions!');
		}
		return message.channel.send(helpEmbeds);
	}
// ------------------------ OWNER ------------------------
	else if (command === "owner" || command === "manager") {
		if (args[0] === "help") {
			const ownerHelp = new MessageEmbed()
				.setColor('#77e4ff')
				.setTitle('Owner comamnd help')
				.setDescription(`Ping the owner of ${serverName}.`)
				.addField('Other names', '`owner`, `manager`');
			return message.channel.send(ownerHelp);
		}
		message.channel.send(`<@681766482304434187>`);
	}
// ------------------------ ECHO ------------------------
	else if (command === "echo" || command === "repeat") {
		if (args[0] === "help") {
			const echoHelp = new MessageEmbed()
				.setColor('#77e4ff')
				.setTitle('Echo comamnd help')
				.setDescription(`Used to echo some text. \n \nCommand: \`${prefix}echo <text>\``)
				.addField('Other names', '`echo`, `repeat`');
			return message.channel.send(echoHelp);
		} else if (!args.length) {
			return message.channel.send(`Hey ${userIDCall}, you didn't provide any text to be echoed lol.`);
		}
		var echoEmbed;
		if (args[0] === "pro") {
			message.delete();
			args.shift();
			// EMBED
			var echoEmbed = new MessageEmbed()
				.setColor('#77e4ff')
				.setTitle('🔊 Echo...')
				.setDescription(`${args}`)
				//? ARGS
				.addField('The `args` variable', `All \`args\` related variables. \`args\` values are the user input after every command.`)
				.addFields(
					{name: '`args`', value: `${args}`, inline: true},
					{name: '`args` (raw)', value: `\`${args}\``, inline: true},
					{name: '`args.length`', value: `${args.length}`, inline: true},
					{name: '`args[0]`', value: `${args[0]}`, inline: true},
					{name: '`args[0].id`', value: `${args[0].id}`, inline: true},
				)
				//? MESSAGE.AUTHOR.<BLANK>
				.addField('Message sources/authors', `All \`message.author.<blank>\` related.`)
				.addFields(
					{name: '`message.author`', value: `${message.author}`, inline: true},
					{name: '`message.author` (raw)', value: `\`${message.author}\``, inline: true},
					{name: '`message.author.id`', value: `${message.author.id}`, inline: true},
					{name: '`message.author.tag`', value: `${message.author.tag}`, inline: true},
				)
				//? ALLMENTIONS
				.addField('The `allMentions` variable', `Variable for \`message.mentions.users.array()\`.`)
				.addFields(
					{name: '`allMentions`', value: `${allMentions}\u200b`, inline: true},
					{name: '`allMentions[0]`', value: `${allMentions[0]}\u200b`, inline: true},
//!	Crashes the app	{name: '`allMentions[0].id`', value: `${allMentions[0].id}`, inline: true}, 
				)
				//? OTHER INFO
				.addField('Other useful info', `See for yourself.`)
				.addFields(
					{name: '`message.guild.name`', value: `${message.guild.name}\u200b`, inline: true},
					{name: '`message.mentions.users.size`', value: `${message.mentions.users.size}\u200b`, inline: true},
				);
		} else {
			var echoEmbed = new MessageEmbed()
				.setColor('#77e4ff')
				.setTitle(`🔊 ${message.author.tag} said`)
				.setDescription(`${args}`);
		}
		return message.channel.send(echoEmbed)
			.catch(console.error);
	}
// ------------------------ SUBJNO ------------------------
	else if (command === "subjno") {
		message.channel.send(`Hey ${userIDCall}, this command isn't finished yet. You can explore other commands on \`${prefix}help\`.`);
	}
// ------------------------ SAD ------------------------
	else if (command === "sad" || command === "(" || command === "'(") {
		if (args[0] === "help") {
			const sadHelp = new MessageEmbed()
				.setColor('#77e4ff')
				.setTitle('`Sad` comamnd help')
				.setDescription(`Let <@748386919460765706> cheer you if you're sad! \n \nCommand: \`${prefix}sad\``)
				.addField('Other names', '`sad`, `(`, `\'(` ') ; 
			return message.channel.send(sadHelp);
		}
		message.channel.send(`Hey ${userIDCall}, there's no room to be sad. Cheering on you through the hard times! <3`);
	}
// ------------------------ ONLINE ------------------------
	else if (command === "online" || command === "on" || command === "active") {
		if (args[0] === "help") {
			const echoHelp = new MessageEmbed()
				.setColor('#77e4ff')
				.setTitle('`Online` comamnd help')
				.setDescription(`Used to determine the number of online members. \n \nCommand: \`${prefix}online\``)
				.addField('Other names', '`online`, `on`, `active`') ; 
			return message.channel.send(echoHelp);
		}
		message.guild.members.fetch().then(fetchedMembers => {
			var totalOnline = fetchedMembers.filter(member => member.presence.status === 'online');
			
			const onlineEmbed = new MessageEmbed()
				.setColor('#44b37f')
				.setTitle(':green_circle: Online Members')
				.setDescription(`There are currently **${totalOnline.size}** members online in this guild!\nRequested by ${userIDCall} (\`${userNameCall}\`)`)
				.setTimestamp()
				.setFooter('Xtrike Bot', `${client.user.displayAvatarURL({ format: "png", dynamic: true })}`);
			message.channel.send(onlineEmbed);
		});
	}
// ------------------------ RESTART ------------------------
	else if (command === "restart") {
		if (message.author.id != ownerID) {
			const NotAllowedEmbed = new MessageEmbed()
				.setDescription(`You cannot restart ${userIDCall}!`);
			return message.channel.send(NotAllowedEmbed);
		}
		console.log(`${userNameCall} requested a bot restart. Restarting...`);
		var restartEmbed = new MessageEmbed()
			.setColor('#77e4ff')
			.setTitle(`Restarting...`)
			.setDescription(`Bot restarting...`)
			.setFooter(`Requested by ${userNameCall}`);
		message.channel.send(restartEmbed)
	//	.then(() => client.destroy())
	//	.then(() => client.login(process.env.DISCORD_TOKEN))
		.then(m =>{
			client.destroy();
			client.login(process.env.DISCORD_TOKEN);
			restartEmbed = new MessageEmbed()
				.setColor('#77e4ff')
				.setTitle(`Bot restarted!`)
				.setDescription(`Restarted bot successfully!`);
			m.edit(restartEmbed);
		});
		client.user.setActivity(`${prefix}help or ${prefix}info`, { type: 'LISTENING' });
		console.log(`Successfully restarted!`);
	}
// ------------------------ MESSAGE ------------------------
	else if (command === "message" || command === "messages" || command === "msg") {
		if(args[0] === "help") {
			const msgHelp = new MessageEmbed()
				.setColor('#77e4ff')
				.setTitle('Message command help')
				.setDescription(`Used to create a message in the form of an embed. \n \nCommand: \`${prefix}message\``)
				.addField('Other names', '`message`, `messages`, `msg`');
			return message.channel.send(msgHelp);
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
				.setColor('#77e4ff')
				.setTitle('Message to ${args[0]}')
				.setDescription(`${messageInputAll}`)
				.setTimestamp()
				.setFooter(`${message.author.tag}`, `${message.author.avatarURL}`);
		} else {
			messageEmbed = new MessageEmbed()
				.setColor('#77e4ff')
				.setTitle('Message')
				.setDescription(`${messageInputAll}`)
				.setTimestamp()
				.setFooter(`${message.author.tag}`, `${message.author.displayAvatarURL({ format: "png", dynamic: true })}`);
		}
		message.delete()
			.catch(console.error);
		message.channel.send(messageEmbed);
	}
// ------------------------ NO-SLEEP ------------------------
/*	else if (command === "nosleep") {
		var counter;
		if (!args.length) {
			message.channel.send("Function no-sleep initiated.");
			console.log("Function no-sleep initiated.");
			var counter = 0;
			var noSleepVar = setInterval(function() {
				counter++;
				message.channel.send(`A message to prevent the bot from dying. This message was sent ${counter} times already.`)
				.then(msg => {
					msg.delete({ timeout: 1000 })
				 })
				.catch(console.error);
				console.log(`No-sleep message sent ${counter} times already.`);
			}, 10000);
			noSleepVar;
		} else if(args[0] === "help") {
			message.channel.send("Use this function to prevent the bot from sleeping. A message will periodically send after you activate this command.");
		} else {
			message.channel.send("Invalid usage of command. Try again.")
			.then(msg => {
				msg.delete({ timeout: 5000 })
			 });
			 message.delete({ timeout: 5000 });
		}
	} */
// ------------------------ PLS ------------------------
	else if (command === "pls") {
		message.channel.send(`Hey ${userIDCall}, there isn't supposed to be a \`${prefix}\` before \`pls\`. Try again.`)
		.then(msg => {
			msg.delete({ timeout: 5000 })
		 });
		 message.delete({ timeout: 5000 });
	}
// ------------------------ HMM ------------------------
	else if (command === "hmm" || command === "hmmmmmm" || command === "hmmm") {
		if(args[0] === "help") {
			const hmmHelp = new MessageEmbed()
				.setColor('#77e4ff')
				.setTitle('Hmm command help')
				.setDescription(`Used to reply "hmm..." to the user \n \nCommand: \`${prefix}hmm\``)
				.addField('Other names', '`hmm`, `hmmmmmm`, `hmmm`'); 
			return message.channel.send(hmmHelp);
		}
		message.delete();
		if(!args.length) {
			message.channel.send(`${userIDCall} hmmmmmm... <:thonking:759407890158190622> `);
		} else {
			message.channel.send(`${args} hmmmmmm... <:thonking:759407890158190622> `);
		}	
	}
});

client.on('shardError', error => {
	 console.error('A websocket connection encountered an error:', error);
});

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});


client.login(process.env.DISCORD_TOKEN);