//const { Command } = require('discord.js-commando');
const BaseCommand = require("../BaseCommand.js");
const Discord = require('discord.js');
const Database = require("../../Database.js");
const Character = require("../../models/Character.js");
const Property = require("../../models/Property.js");
const Utils = require("../../utils/utils.js");
const Config = require("../../Config.js");
const ValidURL = require("valid-url");
const { stripIndents, oneLine } = require('common-tags');

module.exports = class WhoisCommand extends BaseCommand {
	constructor(client) {
		super(client, {
			name: 'whois',
			aliases: [],
			group: 'characters',
			memberName: 'whois',
			format: "[args]",
			description: `Details on your, or another, character on the server.
			
				__Valid Arguments__
				*set <character name> <key> <value>* - Sets a key-value pair for the character specified.
				*portrait [update|set] [url]* - Sets or displays the portrait you have configured as a thumbnail for your character. 
			`,

		});
	}
	
	run(message, arg) {
		var self=this;
		if( arg.trim().length>0 ) {
			let args = Utils.StringUtils.parseArguments(arg);
			let subCommand = args.shift();
			
			switch( subCommand ) {
				
				case "set":
					const member = message.guild.member(message.author);
					var authorized = false;
					Config.adminRoles.forEach(role => {
						if( member.roles.cache.some(r => r.name === role) ) {
							authorized = true;
						}
					});
					if( !authorized ) {
						message.reply("Only authorized users may execute that command.");
						return;
					}
					
					var characterName = args.shift() || null;
					if( characterName ) {
						Character.getCharacterByCharacterName(characterName)
							.then(character => {
								if( character ) {
									var key = args.shift();
									var value = args.shift();
									if( null!=key ) {
										character.getProperties({ where : { key : key }})
											.then(properties => {
												if( properties && properties.length>0 ) {
													var property=properties[0];
													if( null!=value ) {
														property.setDataValue("value", value)
														property.save()
															.then(property => {
																Utils.CharacterUtils.displayCharacter(message,character);
															})
															.catch(err => {
																message.reply("Could not update value for key '" + key + "'");
															});
													} else {
														property.destroy()
															.then(() => {
																Utils.CharacterUtils.displayCharacter(message, character);
															})
													}
												} else {
													var model = Database.getModel(Property.modelName);
													model.create({ key : key, value : value })
														.then(property => {
															character.addProperty(property);
															Utils.CharacterUtils.displayCharacter(message, character);
														})
														.catch(err => {
															message.reply("Could not create property.");
															console.log(err);
														});
												}
											});
									} else {
										self.displayHelp(message);
									}
								} else {
									message.reply(`No character '${characterName}' found`);
								}
							});
					} else {
						this.displayHelp(message);
					}
					break;
				case "help":
					this.displayHelp(message);
					break;
				case "update":
					var characterName = args.shift() || null;
					if( !characterName ) {
						this.displayHelp(message);
					}
					Character.getCharacterByAuthorID(message.author.id)
						.then(character => {
							if( !character ) {
								Character.create({ characterName : characterName, authorID : message.author.id  })
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
					var model = Database.getModel("Character");
					var characterName = subCommand;
					if( !characterName ) {
						self.displaySelf(message);
					} else {
						model.findOne({ where : { characterName : subCommand }})
							.then(character => {
								if( character ) {
									Utils.CharacterUtils.displayCharacter(message, character);
								} else {
									message.reply("No character '" + subCommand + "' found");
								}
							})
					}
					break;
			}
		} else {
			this.displaySelf(message);
		}
	}
	
	displaySelf(message) {
		if( !message ) {
			console.log("Error: whois.displaySelf, no message provided");
			return;
		}
		var self=this;
		Character.getCharacterByAuthorID(message.author.id)
			.then(character => {
				if( !character ) {
					message.reply("No character set.");
				} else {
					Utils.CharacterUtils.displayCharacter(message, character);
				}
			});
	}
};
