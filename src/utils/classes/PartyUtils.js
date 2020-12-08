const Discord = require('discord.js');
const Character = require("../../models/Character.js");
const Party = require("../../models/Party.js");
const PartyMember = require("../../models/PartyMember.js");
const StringUtils = require("./StringUtils.js");
const Database = require("../../Database.js");

module.exports = {
    displayParty(message, party) {
        var embed = new Discord.MessageEmbed();
        embed.setTitle(party.getDataValue("name"));
        
        embed.addFields({ name : "Leader", value : `<@${party.getDataValue("leaderID")}>` });
        
        let partyInvites = [];
        for( let i=0 ; i<party.PartyInvites.length ; i++ ) {
            partyInvites.push(`<@${party.PartyInvites[i].getDataValue("userID")}>`);
        }
        if( message.author.id==party.getDataValue("leaderID") && partyInvites.length>0 ) {
            embed.addFields({ name : "Invited", value : partyInvites.join("\n") });
        }
        
        let partyMembers = [];
        for( let i=0 ; i<party.PartyMembers.length ; i++ ) {
            if( party.PartyMembers[i].getDataValue("isLeader")===false ) {
                partyMembers.push(`<@${party.PartyMembers[i].getDataValue("userID")}>`);
            }
        }
        if( partyMembers.length>0 ) {
            embed.addFields({ name : "Members", value : partyMembers.join("\n") });
        }
        
        message.channel.send(embed)
        	.catch(err => {
        		message.reply("Can't post (do I have embed permissions?)")
        			.then(message => {})
        			.catch(console.error)
        	});
    }
}