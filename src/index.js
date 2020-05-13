const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const fs = require('fs');
const { token, clientID } = require(__dirname + "/../config.json");

//const bot = new Discord.Client();

const bot = new Commando.Client({
	commandPrefix : "!",
	owner : clientID
});

bot.registry
	.registerDefaultTypes()
	.registerGroups([
		['first', 'My first commands']
	])
	.registerDefaultGroups()
	.registerDefaultCommands()
	.registerCommandsIn(path.join(__dirname, 'commands'));

bot.once('ready', () => {
	console.log('Ready!');
	bot.user.setActivity('with Commando');
});

bot.on('message', message => {
	//console.log(message);
	if( message.content=="!ping" ) {
	    message.channel.send("pong!");
	}
	
	if( message.content=="!react" ) {
	   message.react('😄')
	    .then(console.log)
	    .catch(function(err) {
	       console.log(err);
	    });
	}
});

bot.login(token).then(tokenConfirmation => {
	if( tokenConfirmation!=token ) {
		throw "Could not login, tokens do not match";
	}
});