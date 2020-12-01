const Discord = require('discord.js');
const Character = require("../../models/Character.js");
const InventoryEntry = require("../../models/InventoryEntry.js");
const StringUtils = require("./StringUtils.js");
const Database = require("../../Database.js");

module.exports = {
    displayCharacter(message, character) {
		if( !character ) {
			message.reply("Invalid character");
		} else {
			Promise.all([
				new Promise(function(resolve, reject) {
					character.getProperties()
						.then(properties => {
							resolve(properties);
						})
						.catch(err => {
							reject(err);
						})
				}),
				new Promise(function(resolve, reject) {
					character.getWishlistEntries()
						.then(wishlistEntries => {
							resolve(wishlistEntries)
						})
						.catch(err => {
							reject(err);
						})
				}),
				new Promise(function(resolve, reject) {
					character.getInventoryEntries()
						.then(inventoryEntries => {
							resolve(inventoryEntries)
						})
						.catch(err => {
							reject(err);
						})
				})
			])
				.then(function(joinedItems) {
					var properties = joinedItems[0];
					var wishlistEntries = joinedItems[1];
					var inventoryEntries = joinedItems[2];
					
					var embed = new Discord.MessageEmbed()
	                	.addFields(
	                		{ name: `Level`, value: `${Character.xpToLevel(character.getDataValue("xp"))}`, inline: true },
	                		{ name: `XP`, value: `${character.getDataValue("xp")}`, inline: true },
	                		{ name: `Gold`, value: `${character.getDataValue("gold")}`, inline: true }
	                	)
	                
	                embed.setColor('#0099ff');
	        		embed.setTitle(`${character.getDataValue("characterName")}`);
	                	
	                if( null!=character.getDataValue("portrait") ) {
	                	embed.setThumbnail(character.getDataValue("portrait"));
	                }

	                properties.forEach(property => {
	                	embed.addFields({ name : property.key, value : property.value });
	                });
	                
	                // Show wishlist items
	                var entries = [];
			        wishlistEntries.forEach(entry => {
			        	entries.push(`\t${entry.priority ? "*" : "-"} ${entry.description}`);
			        })
			        embed.addFields({ name: `Wishlist (* = priority)`, value: `${StringUtils.emptyToNotEmpty(entries.join("\n"), "None")}` });
			        
			        // Show inventory
			        entries = [];
			        var promises = [];
			        
			        inventoryEntries.forEach(entry => {
			        	promises.push(new Promise(function(resolve, reject) {
			        		entry.getItem()
			        			.then(item => {
			        				entries.push(`${entry.getDataValue("attuned") ? "+" : (null==item.getDataValue("requiresAttunement") ? "-" : "*")} ${item.getDataValue("name")}`);			
			        				resolve();
			        			})
			        			.catch(err => {
			        				reject(err);
			        			});
			        	}));
			        });
			        
			        Promise.all(promises)
			        	.then(() => {
			        		embed.addFields({ name : `Inventory (* = attunement required, + = attuned)`, value : `${StringUtils.emptyToNotEmpty(entries.join("\n"), "None")}` });
	                
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
			        		message.reply("Can't display inventory");
			        		console.error(err);
			        	})
			        
				})
				.catch(err => {
					console.log("Caught error");
					console.log(err);
				});
		}
	},
	
	displayWishlist(message, character, wishlistEntries) {
	    if( wishlistEntries.length==0 ) {
	    	message.channel.send("Empty");
	    } else {
	    	var embed = new Discord.MessageEmbed();
	    	embed.setColor('#0099ff');
	        embed.setTitle(`${StringUtils.possessive(character.getDataValue("characterName"))} Wishlist`);
	        
	        var items = [];
	        
	        wishlistEntries.forEach(entry => {
	        	items.push(`\t${entry.priority ? "*" : "-"} ${entry.description}`);
	        })

	        embed.addFields({ name: `\u200B`, value: `${items.join("\n")}` });
            	
            if( null!=character.getDataValue("portrait") ) {
            	embed.setThumbnail(character.getDataValue("portrait"));
            }

            
            message.channel.send(embed)
            	.then(message => {
            	})
            	.catch(err => {
            		message.reply("Can't post (do I have embed permissions?)")
            			.then(message => {})
            			.catch(console.error)
            	});
	    }
	},
	
	getCharacterByName(message, characterName) {
		var promise = new Promise(function(resolve, reject) {
			// Find all characters that match the provided name 
			Character.findAllLike(characterName)
				.then(characters => {
					if( characters.length>0 ) {
						if( characters.length==1 ) {
							var character = characters[0];
							if( character.getDataValue("characterName").toLowerCase()==characterName.toLowerCase() ) {
								resolve(character);
							} else {
								// confirm it
								StringUtils.confirm(message, `Did you mean ${character.getDataValue("characterName")}?`, { choices : ["y","n"], defaultChoice : "n", hideChoices : true })
									.then(result => {
										if( result==="y" ) {
											resolve(character);
										} else {
											resolve(null);
										}
									})
									.catch(err => {
										message.channel.send("An error has occurred");
										console.error(err);
										reject({ error : err });
									})
							}
						} else {
							// got multiple characters, pick one
							// TODO
							resolve(characters[0]);
						}	
					} else {
						resolve(null);
					}
					
				})
				.catch(err => {
					message.channel.send("An error occurred");
					console.log(err);
					reject({ error : err });
    			})
		});
		
		return promise;
	},
	
	getInventoryEntryByName(message, character, itemName) {
		return new Promise(function(resolve, reject) {
			Database.query("Select ie.* from InventoryEntries ie, Items i where ie.ItemId = i.id and (i.name LIKE :itemName or i.description LIKE :itemName or i.type LIKE :itemName) and ie.CharacterId = :characterId", {
				replacements : {
					itemName : `%${itemName}%`,
					characterId : character.getDataValue("id")
				},
				model : Database.getModel(InventoryEntry.modelName),
				mapToModel : true
			}).then(entries => {
				if( entries.length>0 ) {
						if( entries.length==1 ) {
							var entry = entries[0];
							entry.getItem()
								.then(item => {
									if( item.getDataValue("name").toLowerCase()==itemName.toLowerCase() ) {
										resolve(entry);
									} else {
										// confirm it
										StringUtils.confirm(message, `Did you mean ${item.getDataValue("name")}?`, { choices : ["y","n"], defaultChoice : "n", hideChoices : true })
											.then(result => {
												if( result==="y" ) {
													resolve(entry);
												} else {
													resolve(null);
												}
											})
											.catch(err => {
												message.channel.send("An error has occurred");
												console.error(err);
												reject({ error : err });
											})
									}
								})
								.catch(err => {
									reject(err);
								})
						} else {
							// got multiple entries, pick one
							var choices = [];
							var promises = [];
			        
					        entries.forEach(entry => {
					        	promises.push(new Promise(function(resolve, reject) {
					        		entry.getItem()
					        			.then(item => {
					        				choices.push(item.getDataValue("name"));
					        				resolve();
					        			})
					        			.catch(err => {
					        				reject(err);
					        			});
					        	}));
					        });
					        
					        Promise.all(promises)
					        	.then(() => {
					        		StringUtils.pickOne(message, choices)
					        			.then(choice => {
					        				if( null!=choice ) {
					        					resolve(entries[choice-1]);
					        				} else {
					        					resolve(null);
					        				}
					        			})
					        			.catch(err => {
					        				reject(err);
					        			})
					        	})
					        	.catch(err => {
					        		reject(err);
					        	})
						}	
					} else {
						resolve(null);
					}
			}).catch(err => {
				reject(err);
			})
		});
	},
	
	getAttunedItems(message, character) {
		return new Promise(function(resolve, reject) {
			var model = Database.getModel(InventoryEntry.modelName);
			model.findAll({
				where : {
					CharacterId : character.getDataValue("id"),
					attuned : true
				}
			})
				.then(attunedItems => {
					resolve(attunedItems);
				})
				.catch(err => {
					reject(err);
				})
		})
	}
}