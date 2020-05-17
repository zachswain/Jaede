const { Command } = require('discord.js-commando');
const Discord = require('discord.js');
const Database = require("../../Database.js");
const Character = require("../../models/Character.js");
const Property = require("../../models/Property.js");
const Utils = require("../../utils/utils.js");
const Config = require("../../Config.js");

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
						var model = Database.getModel(Character.modelName);
						model.findOne({ where : { characterName : characterName } })
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
																self.displayCharacter(message,character);
															})
															.catch(err => {
																message.reply("Could not update value for key '" + key + "'");
															});
													} else {
														property.destroy()
															.then(() => {
																self.displayCharacter(message, character);
															})
													}
												} else {
													var model = Database.getModel(Property.modelName);
													model.create({ key : key, value : value })
														.then(property => {
															character.addProperty(property);
															self.displayCharacter(message, character);
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
					var model = Database.getModel("Character");
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
					var model = Database.getModel("Character");
					model.findOne({ where : { characterName : subCommand }})
						.then(character => {
							if( character ) {
								self.displayCharacter(message, character);
							} else {
								message.reply("No charcter '" + subCommand + "' found");
							}
						})
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
		var model = Database.getModel(Character.modelName);
		model.findOne({ where : { authorID : message.author.id, guildID : message.channel.guild.id }})
			.then(character => {
				if( !character ) {
					message.reply("No character set.");
				} else {
					self.displayCharacter(message, character);
				}
			});
	}
	
	displayCharacter(message, character) {
		if( !character ) {
			message.reply("Invalid character");
		} else {
			character.getProperties()
				.then(properties => {
					var embed = new Discord.MessageEmbed()
	                	.addFields(
	                		{ name: `Name`, value: `${character.characterName}` },
	                	);

	                properties.forEach(property => {
	                	embed.addFields({ name : property.key, value : property.value });
	                });
	                
	                message.channel.send(embed)
	                	.then(message => {
	                		
	                	})
	                	.catch(err => {
	                		message.reply("Can't post (do I have embed permissions?)")
	                			.then(message => {})
	                			.catch(console.error)
	                	});
				})
				.catch(err => {
					console.log("Caught error");
					console.log(err);
				});
		}
	}
	
	displayHelp(message) {
		let commands = this.client.registry.findCommands("help", false, message);
		if( commands.length>0 ) {
			commands[0].run(message, { command : this.name });
		}
	}
};
