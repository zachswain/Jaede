const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const fs = require('fs');


const { token, clientID, commandPrefix } = require(__dirname + "/../config.json");

const Utils = require("./utils/utils.js");
const Database = require("./Database.js");

const bot = new Commando.Client({
	commandPrefix : commandPrefix,
	owner : clientID,
	unknownCommandResponse: false
});

if( Database.initialized() ) {
	console.log("Database is initialized");
} else {
	console.log("Database is not initialized");
	Database.init();
}

bot.registry
	.registerDefaultTypes()
	.registerGroups([
		['characters', 'Commands relating to characters on the server']
	])
	.registerDefaultGroups()
	//.registerDefaultCommands()
	.registerCommandsIn(path.join(__dirname, 'commands'));

bot.once('ready', () => {
	Database.sync().then(() => {
		console.log('Ready!');
		
		//var c = Database.getModel("Character");
		//c.findOne({ where : { characterName : "Jaede" }});
		//console.log(c);
	});
	
	bot.user.setActivity('with Commando');
});

bot.on('message', message => {
	//console.log(message);
	if( message.content=="!ping" ) {
	    message.channel.send("pong!");
	}
	
	if( message.content=="!react" ) {
		message
			.react('😄')
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