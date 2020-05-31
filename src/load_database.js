const Database = require("./Database.js");
const Item = require("./models/Item.js");
const magicItems = require("../data/magicitems.json");

if( Database.initialized() ) {
	console.log("Database is initialized");
} else {
	console.log("Database is not initialized");
	Database.init();
	Database.sync().then(() => {
	    magicItems.forEach(magicItem => {
	        magicItem.source = "5E SRD v5.1";
            Item.create(magicItem)
                .then(magicItem => {
                    //console.log(`Created ${magicItem.name}`);
                })
        });
	})
}

