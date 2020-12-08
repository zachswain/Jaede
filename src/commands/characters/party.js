const { Command } = require('discord.js-commando');
const BaseCommand = require("../BaseCommand.js");
const Discord = require('discord.js');
const Database = require("../../Database.js");
const Party = require("../../models/Party.js");
const PartyInvite = require("../../models/PartyInvite.js");
const PartyMember = require("../../models/PartyMember.js");
const Utils = require("../../utils/utils.js");
const Config = require("../../Config.js");

module.exports = class PartyCommand extends BaseCommand {
	constructor(client) {
		super(client, {
			name: 'party',
			aliases: [""],
			group: 'characters',
			memberName: 'party',
			format: "[args]",
			description: `Manage a party of adventurers.
			
				__Valid Arguments__
				*create <party name>* - Create a new party.  Players will use this name to join the party.
				*disband <party name>* - Permanently disbands a party.
				*invite <@player account>* - Invite a player to join the party.
				*join <party name>* - Join a party you've been invited to.
			`,

		});
	}
	
	async run(message, arg) {
	    var self=this;
		let args = Utils.StringUtils.parseArguments(arg);
		let subCommand = args.shift();
		
		if( !subCommand ) {
		    this.displaySelf(message);
		} else {
		    switch( subCommand ) {
		        case "create":
		            var partyName = args.join(" ") || null;
					if( !partyName ) {
						this.displayHelp(message);
					} else {
				        Party.getPartyByName(partyName)
                            .then(party => {
					            if( party ) {
					                message.reply(`A party named '${partyName}' already exists, please use something unique.`);
					            } else {
			                        Party.create({
			                        	name : partyName, 
			                        	creatorID : message.author.id, 
			                        	leaderID : message.author.id,
			                        	PartyMembers : [{
			                        		userID : message.author.id,
			                        		isLeader : true
			                        	}]
			                        },
			                        {
			                        	include : [ Database.getModel(PartyMember.modelName) ]
			                        })
					                    .then(party => {
            					            if( party ) {
            					                   message.reply(`Party '${party.getDataValue("name")}' created.  Send invites using \`\`&party invite\`\``);
            					            } else {
            					                message.reply("Unable to create party");
            					            }
    					                })
    					                .catch(err => {
											message.reply("Error: Could not create your party");
											console.log(err);
										});
					            }
					        })
					}
		            break;
		            
		        case "invite":
		            if( message.mentions.users.size==0 ) {
		                message.reply("Specify invites by mentioning a user.");
		            } else {
		                Party.getPartiesByLeaderID(message.author.id)
		                    .then(async parties => {
		                        if( !parties ) {
		                            message.reply("You're not the leader of a party.");
		                        } else {
		                        	let party=null;
		                        	
		                        	if( parties.length>1 ) {
		                        		let choices = [];
										for( let i=0 ; i<parties.length ; i++ ) {
											choices.push(parties[i].name);
										}
										
										try
										{
											let choice = await Utils.StringUtils.pickOne(message, choices);

											if( null===choice ) {
												message.reply("Nothing picked, request canceled");
											} else {
												party = parties[choice-1];
											}
										}
										catch(err) {
											console.log(err);
										}
		                        	}
		                        	
		                        	if( party ) {
			                            let embed = new Discord.MessageEmbed()
			                                .setTitle(`You have been invited to join the '${party.getDataValue("name")}' party!`)
	                                    	.setDescription(`To accept this invite, run \`\`${Config.commandPrefix}party join ${party.getDataValue("name")}\`\`.`);
	                                    	
	                                    var client = message.client;
	                                    	
			                            var users = message.mentions.users;
	            		                users.map(async user => {
	            		                    const t = await Database.startTransaction();
	            		                    
	            		                    try
	            		                    {
	            		                    	let partyMember = await PartyMember.getByUserIDAndPartyID(user.id, party.getDataValue("id"));
	            		                    	if( !partyMember ) {
		            		                        let invite = await PartyInvite.create({ userID : user.id }, { transaction : t })
		                    		                if( invite ) {
		                    		                    await party.addPartyInvite(invite, { transaction : t })
		        		                                let sent = await user.send(embed)
		        		                                message.reply(`Invite sent to <@${user.id}>`);
		        		                                await t.commit();
		        		                            }
	            		                    	} else {
	            		                    		message.reply(`Cannot invite <@${user.id}>, they are already in the party.`);
	            		                    	}
	            		                    }
	            		                    catch( err ) {
	            		                    	console.log(err);
	            		                        message.reply(`Unable to send invite to <@${user.id}> (have they already been invited?)`);
	            		                        await t.rollback();
	            		                    }
	            		                });
		                        	} else {
		                        		message.reply("Error: Unable to send invites");
		                        	}
		                        }
		                    })
		                
		            }
		            break;
		            
		        case "uninvite":
		            if( message.mentions.users.size==0 ) {
		                message.reply("Specify invites to revoke by mentioning a user.");
		            } else {
		                Party.getPartyByLeaderID(message.author.id)
		                    .then(party => {
		                        if( !party ) {
		                            message.reply("You're not the leader of a party.");
		                        } else {
		                            let embed = new Discord.MessageEmbed()
		                                .setTitle(`Your invite to join '${party.getDataValue("name")}' has been rescinded.`)
                                    	.setDescription(`The party leader has rescinded your invitation.`);
                                    	
		                            var users = message.mentions.users;
            		                users.map(user => {
            		                    PartyInvite.getPartyInviteByUserID(user.id)
            		                        .then(invite => {
            		                            if( invite ) {
                		                            invite.destroy()
                		                                .then(invite => {
                		                                    user.send(embed)
                		                                        .then(sent => {
                		                                            message.reply(`Uninvited ${user.tag}`);
                		                                        })
                		                                        .catch(err => {
                		                                            message.reply(`Error: Unable to uninvite ${user.tag}`);
                		                                        })
                		                                })
                		                                .catch(err => {
                		                                    message.reply(`Error: Unable to uninvite ${user.tag}`); 
                		                                });
            		                            } else {
            		                                message.reply(`Unable to uninvite ${user.tag}`);
            		                            }
            		                        })
            		                });
		                        }
		                    })
		            }
		            break;
		            
	            case "join":
	                var partyName = args.join(" ") || null;
					if( !partyName ) {
						this.displayHelp(message);
					} else {
				        Party.getPartyByName(partyName)
				            .then(async party => {
				                if( party ) {
				                    for( let i=0 ; i<party.PartyInvites.length ; i++ ) {
				                        let invite = party.PartyInvites[i];
				                        if( invite.getDataValue("userID")==message.author.id ) {
				                            let t = await Database.startTransaction();
				                            try {
				                                let partyMember = await PartyMember.create({ userID : invite.getDataValue("userID") }, { transaction : t })
		                                        await party.addPartyMember(partyMember, { transaction : t });
		                                        await invite.destroy({ transaction : t });
		                                        await party.save({ transaction : t });
		                                        message.reply("Welcome to the party!");
		                                        
		                                        var client = message.client;
		                                        let leaderID = party.getDataValue("leaderID");
		                                        let leader = await client.users.fetch(leaderID);
		                                        if( leader ) {
		                                            leader.send(`Good news!  <@${message.author.id}> has accepted your invite to join ${party.getDataValue("name")}.`);
		                                        }
		                                        
		                                        t.commit();
				                            } catch( err ) {
				                                console.log(err);
				                                message.reply("Error: Unable to join the party");
				                                await t.rollback();
				                            }
				                            return;
				                        }
				                    }
				                    
				                    message.reply("I can't find an invite for you, was one sent?");
				                } else {
				                    message.reply("I can't find a party by that name.");
				                }
				            })
					}
					
	                break;
		    }
		}
	}
	
	displaySelf(message) {
		let self=this;
		Party.getPartiesByUserID(message.author.id)
		.then(parties => {
			if( parties && parties.length>0 ) {
				if( parties.length==1 ) {
					let party = parties[0];
					self.displayParty(message, party);
				} else {
					let choices = [];
					for( let i=0 ; i<parties.length ; i++ ) {
						choices.push(parties[i].name);
					}
					
					Utils.StringUtils.pickOne(message, choices)
						.then(choice => {
							if( null===choice ) {
								message.reply("Nothing picked, request canceled");
							} else {
								self.displayParty(message, parties[choice-1]);
							}
						})
						.catch(err => {
							console.log(err);
						});
				}
			} else {
				message.reply("You're not in any  active parties.");
			}
		})
	    .catch(err => {
	    	console.log(err);
	    	message.reply("Error: Could not display party details");
	    })
		message.reply("Display: NYI");
	}
	
	displayParty(message, party) {
		Utils.PartyUtils.displayParty(message, party);
	}
	
}