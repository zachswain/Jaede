const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
const { token } = require("../config-jaede.json");

bot.once('ready', () => {
	console.log('Ready!');
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