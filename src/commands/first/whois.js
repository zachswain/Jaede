const { Command } = require('discord.js-commando');

module.exports = class WhoisCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'whois',
			aliases: [],
			group: 'first',
			memberName: 'whois',
			description: 'A crawler than can extract data such as gold, experience, and magical items.',
		});
	}
	
	run(message) {
	    message.say("whois this?");
	}
};