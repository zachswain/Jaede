// test server #magic-item-log: 696252915626672188
// my server #magic-item-log: 721427279820881920

const { Command } = require('discord.js-commando');
const { Op } = require("sequelize");
const Discord = require('discord.js');
const Database = require("../../Database.js");
const Character = require("../../models/Character.js");
const InventoryEntry = require("../../models/InventoryEntry.js");
const Item = require("../../models/Item.js");
const Utils = require("../../utils/utils.js");
const Config = require("../../Config.js");
const BaseCommand = require("../BaseCommand.js");

module.exports = class ItemDBCommand extends BaseCommand {
	constructor(client) {
		super(client, {
			name: 'itemdb',
			aliases: [],
			group: 'items',
			memberName: 'itemdb',
			format: "[args]",
			description: `Details on an item from the 5E SRD database, expanded with Macguffin specific items.
			
				__Valid Arguments__
                <item name> - Looks up a specific item by its name.
                *give* <character name> <item name> [-r reason] - Give an item to a character, optionally specifying a reason (e.g. quest, purchase, etc.).
			`,

		});
	}
	
	run(message, arg) {
	    var self=this;
		let args = Utils.StringUtils.parseArguments(arg);
		var subCommand = args.shift();

		if( subCommand=="" ) {
			message.channel.send(`Error: item name is a required argument that is missing\nUse \`${Config.commandPrefix}help ${this.name}\` for help.`);
		} else {
			switch( subCommand ) {
				case "create":
					if( args.length==0 ) {
						this.interactiveCreate(message);
					}
					break;
				case "view":
					var itemName = args.join(" ");
			        Item.findAllLike(itemName)
			            .then(items => {
			                if( items ) {
			                    Utils.ItemUtils.displayItem(message, items);
			                } else {
			                    message.channel.send(`I couldn't find an item by the name '${itemName}'`);
			                }
			            })
			    	break;
			    case "take":
			    	var characterName = args.shift();
			    	
			    	Utils.CharacterUtils.getCharacterByName(message, characterName)
			    		.then(character => {
			    			if( character ) {
			    				var itemName = args.shift();
			    				Utils.CharacterUtils.getInventoryEntryByName(message, character, itemName)
			    					.then(inventoryEntry => {
			    						if( null==inventoryEntry ) {
			    							message.channel.send("No item found/selected");
			    						} else {
			    							inventoryEntry.getItem()
			    								.then(item => {
	    											message.channel.send(`Taking item ${item.getDataValue("name")} from ${character.getDataValue("characterName")}`);
	    											character.removeInventoryEntry(inventoryEntry)
	    												.then(character => {
	    													message.channel.send("Removed");
	    												})
	    												.catch(err => {
	    													message.channel.send("An error occurred");
	    													console.error(err);
	    												})
			    								})
			    								.catch(err => {
			    									message.channel.send("An error occurred");
			    									console.error(err);
			    								})
			    						}
			    					})
			    			} else {
			    				message.channel.send("No character found/selected");
			    			}
						})
						.catch(err => {
							message.channel.send("An error occurred");
							console.error(err);
						})
			    	break;
			    case "give":
			    	var characterName = args.shift();
			    	var reason=null;
			    	
			    	for( var i=0 ; i<args.length ; i++ ) {
			    		if( args[i]=="-r" ) {
			    			if( i<args.length-1 ) {
			    				reason=args[i+1];
			    				args.splice(i,2);
			    				i--;
			    				console.log("reason: " + reason);
			    			} else {
			    				message.reply("You must provide a reason with -r");
			    			}
			    		}
			    	}
			    	
			    	Utils.CharacterUtils.getCharacterByName(message, characterName)
			    		.then(character => {
			    			if( character ) {
			    				var itemName = args.shift();
			    				Utils.ItemUtils.getItemByName(message, itemName)
			    					.then(item => {
			    						if( null==item ) {
			    							message.channel.send("No item found/selected");
			    						} else {
			    							var inventoryEntry = InventoryEntry.createFromItem(item);
			    							inventoryEntry.save()
			    								.then(entry => {
			    									character.addInventoryEntry(entry);
			    									var client = message.client;
			    									message.channel.send(`Gave item ${item.getDataValue("name")} to ${character.getDataValue("characterName")}`);
			    									client.channels.fetch(Config.commands.itemdb.magicItemLogChannel)
			    										.then(channel => {
			    											if( channel ) {
			    												channel.send(`Character: ${character.getDataValue("characterName")}\nItem: ${item.getDataValue("name")}${reason?`\nReason: ${reason}`:``}`);
			    											} else {
			    												console.error("Couldn't get channel to send message");
			    											}
			    										});
			    								});
			    						}
			    					})
			    			} else {
			    				message.channel.send("No character found/selected");
			    			}
						})
						.catch(err => {
							message.channel.send("An error occurred");
							console.error(err);
						})
			    	break;
			    default:
			        args.unshift(subCommand);
			        var itemName = args.join(" ");
			        if( itemName.trim()=="" ) {
			        	this.displayHelp(message);
			        } else {
				        Item.findAllLike(itemName)
				            .then(items => {
				                if( items ) {
				                    Utils.ItemUtils.displayItem(message, items);
				                } else {
				                    message.channel.send(`I couldn't find an item by the name '${itemName}'`);
				                }
				            })
			        }
			        break;
			}
		}
	}
	
	interactiveCreate(message) {
		var model = Database.getModel(Item.modelName);
		var item = model.build({
			name : null,
			description : null,
			type : null,
			rarity : null,
			requiresAttunement : null,
			source : message.author.username + "#" + message.author.discriminator
		});
		
		this.editItem(message, item);
	}
	
	editItem(message, item) {
		var self=this;

		var prompt = "While editing, type one of (`name`|`description`|`type`|`rarity`|`attunement`) to edit one of the items' properties.  Type `save` to save the item, or `display` to redisplay it.";
		
		var filter = response => {
			return ["name","description","type","rarity","attunement","display", "save"].some(command => { return command.toLowerCase()===response.content.toLowerCase() })
			&&
			message.author.id === response.author.id
		};
		
		var embed = new Discord.MessageEmbed()
			.setTitle("Item Editor")
			.setDescription(prompt)
        	.setColor('#0099ff');    
        message.channel.send(embed)
			.then(() => {
				var choice;
				var collector = message.channel.createMessageCollector(filter, { max: 1, time: 20000, errors: ['time'] })
				
				collector.on("collect", m => {
					choice = m.content;
				});
				
				collector.on("end", m => {
					switch( choice ) {
						case "name":
							self.editName(message, item);
							break;
						case "description":
							self.editDescription(message, item);
							break;
						case "type":
							self.editType(message, item);
							break;
						case "rarity":
							self.editRarity(message,item);
							break;
						case "attunement":
							self.editAttunement(message,item);
							break;
						case "display":
							Utils.ItemUtils.displayOneItem(message, item)
								.then(m => {
									self.editItem(message, item);
								})
							break;
						case "save":
							item.save()
								.then(i => {
									message.channel.send("Item saved");
								});
								break;
						default:
							message.channel.send("No input received, cancelling editing");
							break;
					}
				})
			})
			.catch(err => {
				message.channel.send("I can't post (do I have embed permissions?)")
        			.then(message => { })
        			.catch(console.error)
			});  
	}
	
	editName(message, item) {
		var self=this;
		
		var name = item.getDataValue("name") ? item.getDataValue("name") : "No name set";
		
		var prompt = `Current name: ${name}\nEnter a new name for this item, or \`.\` to leave it as it is.`;
		
		var filter = response => {
			return true;
		};
		
		var embed = new Discord.MessageEmbed()
			.setTitle("Item Editor - Name")
			.setDescription(prompt)
        	.setColor('#0099ff');    
        message.channel.send(embed)
			.then(() => {
				var choice=null;
				var collector = message.channel.createMessageCollector(filter, { max: 1, time: 20000, errors: ['time'] })
				
				collector.on("collect", m => {
					choice = m.content;
				});
				
				collector.on("end", m => {
					if( null==choice) {
						// return without editing
						message.channel.send("No input received, returning");
					} else if( choice.trim()==="." ) {
						message.channel.send("Okay, keeping things the same.");
					} else {
						message.channel.send(`Changing name to '${choice}'`);
						item.setDataValue("name", choice);
					}
					
					self.editItem(message, item);
				});
			})
	}
	
	editType(message, item) {
		var self=this;
		
		var type = item.getDataValue("type") ? item.getDataValue("type") : "No type set";
		
		var types = ["Armor", "Potion", "Ring", "Rod", "Wand", "Weapon", "Wondrous Item"];
		
		var prompt = `Current type: ${type}\nEnter the type for this item, or '.' to leave it the same:\n`;
		
		var options = [];
		for( var i=0 ; i<types.length ; i++ ) {
			options.push(`[${i+1}] ${types[i]}`);	
		};
		
		prompt += options.join("\n");
		
		var filter = response => {
			return ["1","2","3","4","5","6","7","."].some(r => r.trim()===response.content.trim())
		};
		
		var embed = new Discord.MessageEmbed()
			.setTitle("Item Editor - Type")
			.setDescription(prompt)
        	.setColor('#0099ff');
        message.channel.send(embed)
			.then(() => {
				var choice=null;
				var collector = message.channel.createMessageCollector(filter, { max: 1, time: 20000, errors: ['time'] })
				
				collector.on("collect", m => {
					choice = m.content;
				});
				
				collector.on("end", m => {
					if( null==choice) {
						// return without editing
						message.channel.send("No input received, returning");
					} else if( choice.trim()==="." ) {
						message.channel.send("Okay, keeping things the same.");
					} else {
						var type = types[parseInt(choice)-1];
						message.channel.send(`Changing type to '${type}'`);
						item.setDataValue("type", type);
					}
					
					self.editItem(message, item);
				});
			})
	}
	
	editDescription(message, item) {
		var self=this;
		
		var description = item.getDataValue("description") ? item.getDataValue("description") : "No description set";
		
		var prompt = `Current description: ${description}\nEnter a new description for this item, or \`.\` to leave it as it is.`;
		
		var filter = response => {
			return message.author.id === response.author.id
		};
		
		var embed = new Discord.MessageEmbed()
			.setTitle("Item Editor - Description")
			.setDescription(prompt)
        	.setColor('#0099ff');    
        message.channel.send(embed)
			.then(() => {
				var input=null;
				var collector = message.channel.createMessageCollector(filter, { max: 1, time: 20000, errors: ['time'] })
				
				collector.on("collect", m => {
					input = m.content;
				});
				
				collector.on("end", m => {
					if( null==input) {
						// return without editing
						message.channel.send("No input received, returning");
					} else if( input.trim()==="." ) {
						message.channel.send("Okay, keeping things the same.");
					} else {
						message.channel.send(`Changing description to '${input}'`);
						item.setDataValue("description", input);
					}
					
					self.editItem(message, item);
				});
			})
	}
	
	editRarity(message, item) {
		var self=this;
		
		var rarity = item.getDataValue("rarity") ? item.getDataValue("rarity") : "No rarity set";
		
		var rarities = ["uncommon", "rare", "very rare", "legendary", "artifact"];
		
		var prompt = `Current rarity: ${rarity}\nEnter the rarity for this item, or '.' to leave it the same:\n`;
		
		var options = [];
		for( var i=0 ; i<rarities.length ; i++ ) {
			options.push(`[${i+1}] ${rarities[i]}`);	
		};
		
		prompt += options.join("\n");
		
		var filter = response => {
			return (
				["1","2","3","4","5","."].some(r => r.trim()===response.content.trim()) 
				&&
				message.author.id === response.author.id
			);
		};
		
		var embed = new Discord.MessageEmbed()
			.setTitle("Item Editor - Rarity")
			.setDescription(prompt)
        	.setColor('#0099ff');
        message.channel.send(embed)
			.then(() => {
				var choice=null;
				var collector = message.channel.createMessageCollector(filter, { max: 1, time: 20000, errors: ['time'] })
				
				collector.on("collect", m => {
					choice = m.content;
				});
				
				collector.on("end", m => {
					if( null==choice) {
						// return without editing
					} else if( choice.trim()==="." ) {
						message.channel.send("Okay, keeping things the same.");
					} else {
						var rarity = rarities[parseInt(choice)-1];
						message.channel.send(`Changing rarity to '${rarity}'`);
						item.setDataValue("rarity", rarity);
					}
					
					self.editItem(message, item);
				});
			})
	}
	
	editAttunement(message, item) {
		var self=this;
		
		var attunement = null==item.getDataValue("attunement") ? false : true;

		var prompt = `Item currrently ${attunement ? "DOES" : "does NOT"} require attunement`;
		
		attunement  = !attunement;
		
		message.channel.send(`Changing item to ${attunement ? "REQUIRE" : "NOT require"} attunement.`);
		item.setDataValue("requiresAttunement", attunement ? "requires attunement" : null);
		self.editItem(message, item);
	}
}