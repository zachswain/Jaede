const Sequelize = require("sequelize");

module.exports = {
    model : {
    	characterName : {
    		type : Sequelize.STRING
    	},
    	authorID: {
    		type: Sequelize.STRING,
    		primaryKey : true
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
    }
}