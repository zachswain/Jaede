const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
	//console.log(message);
	if( message.content=="!ping" ) {
	    message.channel.send("pong!");
	}
	
	if( message.content=="!react" ) {
	   message.react('😄')
	    .then(console.log)
	    .catch(function(err) {
	       console.log(err);
	    });
	}
});

try {
    var token = fs.readFileSync('../token', 'utf8');
    client.login(token);
} catch (e) {
    console.log("Error: " + e.stack);
    process.exit();
}