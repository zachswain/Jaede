module.exports = {
    modelName : "Item"
};

/*
 * Based on the magicitems.json found here: https://github.com/eepMoody/open5e-api/tree/master/data/WOTC_5e_SRD_v5.1
 *
 */

const Sequelize = require("sequelize");
const Database = require("../Database.js");
const Character = require("./Character.js");

Object.assign(module.exports, {
    modelName : "Item",
    model : {
    	name : {
    		type : Sequelize.CITEXT,
    		allowNull : false,
    	},
    	description : {
    	    type : Sequelize.CITEXT,
    	},
    	type : {
    	    type : Sequelize.CITEXT,
    	},
    	rarity : {
    	    type : Sequelize.CITEXT
    	},
    	requiresAttunement : {
    	    type: Sequelize.STRING
    	},
    	source : {
    	    type: Sequelize.CITEXT
    	}
    },
    relationships : [
    ],
    options : {
        indexes : [
            {
                name : "name_unique",
                unique : true,
                fields : ["name"]
            }
        ]
    },
    
    create(args) {
        var model = Database.getModel(this.modelName);
        return model.create(args);
    },
    
    findAllByItemName(itemName) {
        var model = Database.getModel(this.modelName);
        return model.findAll({ where : { name : itemName }})
    },
    
    findAllLikeItemName(itemName) {
        var model = Database.getModel(this.modelName);
        return model.findAll({ where : { name : { [Sequelize.Op.substring] : itemName } } })
    },
    
    findAllLike(keyword) {
        var model = Database.getModel(this.modelName);
        return model.findAll({ where : 
            {
                [Sequelize.Op.or] : [
                    { name : { [Sequelize.Op.substring] : keyword } },
                    { type : { [Sequelize.Op.substring] : keyword } },
                    { description : { [Sequelize.Op.substring] : keyword } }
                ]
            }   
        })
    }
});