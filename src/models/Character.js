const Sequelize = require("sequelize");
const Property = require("./Property.js");

module.exports = {
    modelName : "Character",
    model : {
    	characterName : {
    		type : Sequelize.CITEXT,
    	},
    	authorID: {
    		type: Sequelize.STRING
    	},
    	guildID : {
    		type: Sequelize.STRING
    	},
    	xp : {
    	  type : Sequelize.INTEGER,
    	  default : 0
    	},
    	gold  :{
    	  type : Sequelize.INTEGER,
    	  default : 0
    	}
    },
    relationships : [
        { modelName : Property.modelName, relationship : "hasMany" }
    ],
    options : {
        indexes : [
            {
                name : "authorID_unique",
                unique : true,
                fields : ["authorID"]
            }
        ]
    }
}