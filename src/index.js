const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const fs = require('fs');
const Config = require("./Config.js");
const Utils = require("./utils/utils.js");
const Database = require("./Database.js");
const Character = require("./models/Character.js");
const Property = require("./models/Property.js");

const bot = new Commando.Client({
	commandPrefix : Config.commandPrefix,
	owner : Config.clientID,
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
		
		/*
		var c = Database.getModel(Character.modelName);
		c.create({ characterName : "jaede", authorID : 1, guildID : 1 })
			.then(character => {
				var p = Database.getModel(Property.modelName);
				p.create({ key : "a key", value : "a value" })
					.then(property => {
						character.addProperty(property);
					});
			});
		*/
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

bot.login(Config.token).then(tokenConfirmation => {
	if( tokenConfirmation!=Config.token ) {
		throw "Could not login, tokens do not match";
	}
});