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
		['characters', 'Commands relating to characters registered on the server'],
		['items', 'Commands relating to items usable on the server.'],
		['util', 'Utility commands']
	])
	.registerDefaultGroups()
	//.registerDefaultCommands()
	.registerCommandsIn(path.join(__dirname, 'commands'));

bot.once('ready', () => {
	console.log("Syncing database");
	Database.sync().then(() => {
		console.log('Ready!');
	});
		
	
	bot.user.setActivity('with Commando');
});

console.log("Logging in...");
bot.login(Config.token).then(tokenConfirmation => {
	console.log("Bot logged in");
	if( tokenConfirmation!=Config.token ) {
		throw "Could not login, tokens do not match";
	}
});