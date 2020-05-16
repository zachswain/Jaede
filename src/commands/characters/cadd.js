const { Command } = require('discord.js-commando');
const Database = require("../../Database.js");

module.exports = class CAddCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'cadd',
			aliases: [],
			format : "[characterName]",
			group: 'characters',
			memberName: 'cadd',
			description: 'Add a character for tracking.',
			details : "Some details",
			args : [
			    {
			        key : "characterName",
			        prompt : "What's the name of the character to add?",
			        type : "string"
			    }
			]
		});
	}
	
	run(message, args) {
		console.log(args);
		/*
		Database.CharactersTable.findAll({ where : { authorID : message.author.id, characterName : characterName }})
			.then(existingCharacter => {
				if( existingCharacter.length>0 ) {
					message.reply("You already have a registered character with that name.");
				} else {
					Database.CharactersTable.create({
						authorID : message.author.id,
						guildID : message.channel.guild.id,
						characterName : characterName
					}).then(character => {
						message.reply(`Character ${character.characterName} added.`);
					}).catch(function(err) {
						console.log(`Error in !cadd({ authorID=>${message.author.id}, guildID=>${message.channel.guild.id}, characterName=>${characterName} }), err=>${err}`);
						message.reply(`Could not create character ${characterName}`);
					});
				}
			})
			*/
	}
}