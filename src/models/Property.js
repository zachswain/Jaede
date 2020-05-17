const Sequelize = require("sequelize");

module.exports = {
    modelName : "Property",
    model : {
    	key : {
    		type : Sequelize.STRING
    	},
    	value : {
    		type: Sequelize.STRING
    	}
    },
    options : {
    }
}