const { Command } = require('discord.js-commando');
const BaseCommand = require("../BaseCommand.js");
const Discord = require('discord.js');
const Database = require("../../Database.js");
const Character = require("../../models/Character.js");
const Utils = require("../../utils/utils.js");
const Config = require("../../Config.js");
const ValidURL = require("valid-url");

module.exports = class CharacterCommand extends BaseCommand {
	constructor(client) {
		super(client, {
			name: 'character',
			aliases: ["char"],
			group: 'characters',
			memberName: 'character',
			format: "[args]",
			description: `Manage your character on the Macguffin server.
			
				__Valid Arguments__
				*create <character name>* - Create a new character.
				*set <portrait|name> <args>* - Sets an attribute of your character with provided arguments.
			`,

		});
	}
	
	run(message, arg) {
	    var self=this;
		let args = Utils.StringUtils.parseArguments(arg);
		let subCommand = args.shift();
		
		if( !subCommand ) {
			this.displaySelf(message);
		} else {
			switch( subCommand ) {
				case "create":
					var characterName = args.join(" ") || null;
					if( !characterName ) {
						this.displayHelp(message);
					} else {
						Character.getCharacterByAuthorID(message.author.id)
							.then(character => {
								if( !character ) {
									Character.create({ characterName : characterName, authorID : message.author.id  })
										.then(character => {
											Utils.CharacterUtils.displayCharacter(message,character);
										})
								} else {
									var filter = response => {
										return ["y","n"].some(yn => yn.toLowerCase() === response.content.toLowerCase());
									};

									message.reply("You have already created a character.  This will overwrite your existing character.  Are you sure? [y/N]").then(() => {
										message.channel.awaitMessages(filter, { max: 1, time: 10000, errors: ['time'] })
											.then(collected => {
												if( collected.first().content.toLowerCase()=="y" ) {
													character.destroy()
														.then(() => {
															Character.create({ characterName : characterName, authorID : message.author.id  })
																.then(character => {
																	Utils.CharacterUtils.displayCharacter(message,character);
																})
														})
												} else {
													collected.first().reply("Cancelling the request");
												}
											})
											.catch(collected => {
												collected.first().reply('Cancelling the request');
											});	
									});
								}
							});
					}
					break;
				case "update":
				case "set":
					Character.getCharacterByAuthorID(message.author.id)
						.then(character => {
							if( !character ) {
								message.reply("You don't have a character registered.");
							} else {
								var arg = args.shift();
								if( arg ) {
									switch( arg ) {
										case "name":
											if( args.length==0 ) {
												message.reply("Invalid name specified");
											} else {
												var name = args.join(" ");
												character.setDataValue("characterName", name);
												character.save()
													.then(property => {
														Utils.CharacterUtils.displayCharacter(message,character);
													})
													.catch(err => {
														message.reply("Could not update your character");
													});
											}
											break;
										case "portrait":
											var url = args.join(" ");
											if( ValidURL.isUri(url) ) {
												message.reply("Setting portrait to " + url);
												character.setDataValue("portrait", url);
												character.save()
													.then(property => {
														Utils.CharacterUtils.displayCharacter(message,character);
													})
													.catch(err => {
														message.reply("Could not update your character");
													});
											} else {
												message.reply(url + " doesn't look like a valid URL.");
											}
											break;
										default:
											message.reply("Invalid argument, use " + Config.commandPrefix + "help for the valid arguments");
											break;
									}
								} else {
									if( null!=character.portrait ) {
										message.channel.send(`${character.portrait}`, {
				    						file: character.portrait
										});
									} else {
										message.reply("No portrait set.");
									}
								}
							}
						})
					break;
				case "display":
				case "view":
					this.displaySelf(message);
					break;
				case "help":
					this.displayHelp(message);
					break;
				default:
					message.reply("Invalid argument, use " + Config.commandPrefix + "help for the valid arguments");
					break;
			}
		}
	}
	
	displaySelf(message) {
		Character.getCharacterByAuthorID(message.author.id)
			.then(character => {
				if( !character ) {
					message.reply("You don't have a character registered.");
				} else {
					Utils.CharacterUtils.displayCharacter(message, character);
				}
			});
	}
}