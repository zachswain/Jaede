const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const fs = require('fs');
const { token, clientID } = require(__dirname + "/../config.json");
const Sequelize = require("sequelize");
const Database = require("./Database.js");

const bot = new Commando.Client({
	commandPrefix : "!",
	owner : clientID
});

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite'
});

const CharactersTable = sequelize.define('characters', {
	characterName : {
		type : Sequelize.STRING
	},
	userID: {
		type: Sequelize.STRING
	},
	guildID : {
		type: Sequelize.STRING
	}
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
	CharactersTable.sync();
	console.log('Ready!');
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
	    	
		const character = CharactersTable.upsert({
			characterName : "",
			userID : message.author.id,
			guildID : message.channel.guild.id
		});
		
	}
});

bot.login(token).then(tokenConfirmation => {
	if( tokenConfirmation!=token ) {
		throw "Could not login, tokens do not match";
	}
});