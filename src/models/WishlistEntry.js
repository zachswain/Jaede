const Sequelize = require("sequelize");
const Database = require("../Database.js");

module.exports = {
    modelName : "WishlistEntry",
    model : {
    	description : {
    		type : Sequelize.CITEXT,
    		allowNull : false,
    	},
    	priority : {
    	    type : Sequelize.BOOLEAN,
    	    allowNull : false,
    	    defaultValue : false
    	}
    },
    
    create(args) {
        var model = Database.getModel(this.modelName);
        return model.create(args);
    },
}