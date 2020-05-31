const { Command } = require('discord.js-commando');
const BaseCommand = require("../BaseCommand.js");
const Discord = require('discord.js');
const Database = require("../../Database.js");
const Character = require("../../models/Character.js");
const WishlistEntry = require("../../models/WishlistEntry.js");
const Utils = require("../../utils/utils.js");
const Config = require("../../Config.js");

module.exports = class CharacterCommand extends BaseCommand {
	constructor(client) {
		super(client, {
			name: 'wishlist',
			aliases: [],
			group: 'characters',
			memberName: 'wishlist',
			format: "[args]",
			description: `Manage your character's wishlist.
			
			__Valid Arguments__
			*add* <item description> - Adds an item to your wishlist
			*remove* <item description> - Removes an item from your wishlist
			*priority* <item description> - Toggles the priority setting for an item on your wishlist
			`,

		});
	}
	
	run(message, arg) {
	    var self=this;
		let args = Utils.StringUtils.parseArguments(arg);
		let subCommand = args.shift();
		
		
		if( !subCommand ) {
		    this.displaySelfWishlist(message);
		} else {
		    switch( subCommand ) {
				case "add":
					Character.getCharacterByAuthorID(message.author.id)
						.then(character => {
							if( !character ) {
								message.reply("You don't have a character registered.");
							} else {
								var itemDescription = args.join(" ").trim();
								if( itemDescription.length==0 ) {
									message.reply("Invalid item description");
								} else {
									character.getWishlistEntries({ where : { description : itemDescription } })
										.then(entries => {
											if( entries.length>0 ) {
												message.reply("An item with that description is already on your wishlist");
											} else {
												WishlistEntry.create({ description : itemDescription })
													.then(entry => {
														character.addWishlistEntry(entry);
														message.reply(`${entry.getDataValue("description")} added to your wishlist`);
													});
											}
										});
									
								}
							}
						})
				    break;
				case "remove":
				case "delete":
					Character.getCharacterByAuthorID(message.author.id)
						.then(character => {
							if( !character ) {
								message.reply("You don't have a character registered.");
							} else {
								var itemDescription = args.join(" ").trim();
								if( itemDescription.length==0 ) {
									message.reply("Invalid item description");
								} else {
									character.getWishlistEntries({ where : { description : itemDescription } })
										.then(entries => {
											if( entries.length==0 ) {
												message.reply("No item matching that description is on your wishlist");
											} else {
												entries.forEach(entry => {
													message.reply(`Removing ${entry.getDataValue("description")}`);
													entry.destroy();
												})
											}
										});
									
								}
							}
						})
					break;
				case "priority":
					Character.getCharacterByAuthorID(message.author.id)
						.then(character => {
							if( !character ) {
								message.reply("You don't have a character registered.");
							} else {
								var itemDescription = args.join(" ").trim();
								if( itemDescription.length==0 ) {
									message.reply("Invalid item description");
								} else {
									character.getWishlistEntries({ where : { description : itemDescription } })
										.then(entries => {
											if( entries.length==0 ) {
												message.reply("No item matching that description is on your wishlist");
											} else {
												entries.forEach(entry => {
													entry.setDataValue("priority", !entry.getDataValue("priority"));
													entry.save()
														.then(entry => {
															message.reply(`Item "${entry.getDataValue("description")}"" ${entry.getDataValue("priority") ? "is" : "is not"} a priority`);															
														})
														.catch(() => {
															message.reply(`Could not change the priority for "${entry.getDataValue("description")}"`);
														});
												})
											}
										});
								}
							}
						})
					break;
				case "view":
					var characterName = args.join(" ");
					if( characterName ) {
						Character.getCharacterByCharacterName(characterName)
							.then(character => {
								if( !character ) {
									message.reply(`Could not find a character named '${characterName}'`);
								} else {
									character.getWishlistEntries()
										.then(entries => {
											Utils.CharacterUtils.displayWishlist(message, character, entries);
										})
								}
							})
					} else {
						// display this Player's wishlist
						this.displaySelfWishlist(message);
					}
					break;
				default:
				    break;
		    }
		}
	}
	
	displaySelfWishlist(message) {
	    Character.getCharacterByAuthorID(message.author.id)
			.then(character => {
				if( !character ) {
					message.reply("You don't have a character registered.");
				} else {
				    character.getWishlistEntries()
				        .then(wishlist => {
				            Utils.CharacterUtils.displayWishlist(message, character, wishlist);  
				        })
				}
			});
	}
	
	
}