const { Command } = require('discord.js-commando');
const Database = require("../../Database.js");
const Utils = require("../../utils/utils.js");

module.exports = class WhoisCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'whois',
			aliases: [],
			group: 'characters',
			memberName: 'whois',
			format: "[set|update]",
			description: 'Details on your, or another, character on the server.',

		});
	}
	
	run(message, arg) {
		if( arg.trim().length>0 ) {
			let args = Utils.StringUtils.parseArguments(arg);
			let subCommand = args.shift();
			switch( subCommand ) {
				case "set":
					
					break;
				case "help":
					this.displayHelp(message);
					break;
				case "update":
					let characterName = args.shift() || null;
					if( !characterName ) {
						this.displayHelp();
					}
					let model = Database.getModel("Character");
					model.findOne({ where : { authorID : message.author.id, guildID : message.channel.guild.id }})
						.then(character => {
							if( !character ) {
								model.create({ characterName : characterName, authorID : message.author.id, guildID : message.channel.guild.id })
									.then(character => {
										message.reply("Character name set: " + character.get("characterName"));	
									})
							} else {
								character.update({ characterName : characterName })
									.then(() => {
										message.reply("Character name updated: " + character.get("characterName"));
									})
							}
						});
					break;
				default:
					this.displayCharacter({
						authorID : message.author.id,
						guildID : message.channel.guild.id
					});
					break;
			}
		} else {
			this.displayCharacter(message);
		}
	}
	
	displayCharacter(message, character) {
		let model = Database.getModel("Character");
		model.findOne({ where : { authorID : message.author.id, guildID : message.channel.guild.id }})
			.then(character => {
				if( !character ) {
					message.reply("No character set.");
				} else {
					message.reply(`Character: ${character.characterName}`);
				}
			});
	}
	
	displayHelp(message) {
		let commands = this.client.registry.findCommands("help", false, message);
		if( commands.length>0 ) {
			commands[0].run(message, { command : "whois" });
		}
	}
};
