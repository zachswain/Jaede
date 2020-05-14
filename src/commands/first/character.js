const { Command } = require('discord.js-commando');

module.exports = class CharacterCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'character',
			aliases: [],
			group: 'first',
			memberName: 'character',
			description: 'Sets the active character',
			args : [
			    {
			        key : "characterName",
			        prompt : "What's the name of the character you want to select?",
			        type : 'string'
			    }
			]
		});
	}
	
	run(message, { characterName }) {
	    var userID = message.author.id;
	    var guildID = message.channel.guild.id;
	    
	    console.log('Loading/Settings characterName=${characterName} for user=${userID}');
	}
};