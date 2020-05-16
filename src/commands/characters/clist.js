const { Command } = require('discord.js-commando');
const Database = require("../../Database.js");

module.exports = class CListCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'clist',
			aliases: [],
			group: 'characters',
			memberName: 'clist',
			description: 'Lists all characters you have registered on the server.',
		});
	}
	
	run(message) {
	    console.log("running !clist");
	    console.log("Author ID: " + message.author.id);

		let query ="";
	    if( message.channel.type=="dm" ) {
	    	query = { where : { authorID : message.author.id } };
	    } else {
	    	query = { where : { authorID : message.author.id, guildID : message.channel.guild.id }}
	    }

	    Database.CharactersTable.findAll(query)
	        .then(characters => {
	            console.log(characters);
	            console.log("length: " + characters.length);
        	    if( characters ) {
        	        if( characters.length==0 ) {
        	            message.say("No characters found");
        	        } else {
        	            let names=[];
        	            for( let character of characters ) {
        	            	names.push(character.characterName);
        	            }
        	            message.reply("Characters: " + names.join(", "));
        	        }
        	    } else {
        	        message.reply("No characters found (error)");
        	    }
	        });
	    /*
	    const character = CharactersTable.upsert({
			characterName : "Grimbly",
			userID : message.author.id,
			guildID : message.channel.guild.id
		});
		*/
	}
};