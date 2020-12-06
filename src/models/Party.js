module.exports = {
    modelName : "Party"
};

const Sequelize = require("sequelize");
const Database = require("../Database.js");

const Character = require("./Character.js");
const PartyInvite = require("./PartyInvite.js");
const PartyMember = require("./PartyMember.js");

module.exports = {
    modelName : "Party",
    model : {
    	name : {
    		type : Sequelize.CITEXT,
    		allowNull : false,
    	},
    	
    	creatorID : {
    	    type : Sequelize.STRING,
    	    allowNull : false
    	},
    	
    	leaderID : {
    	    type : Sequelize.STRING,
    	    allowNull : true
    	},
    	
    	status : {
    	   type : Sequelize.TINYINT,
    	   allowNull : false,
    	   defaultValue : 0 // 0=Active, 1=Inactive, 2=Disbanded
    	},
    	
    	
    },
    relationships : [
        { modelName : Character.modelName, relationship : "hasMany" },
        { modelName : PartyInvite.modelName, relationship : "hasMany" },
        { modelName : PartyMember.modelName, relationship : "hasMany" },
    ],
    
    create(args, options=null) {
        var model = Database.getModel(this.modelName);
        return model.create(args, options);
    },
    
    getPartyByName(name) {
        var model = Database.getModel(this.modelName);
		return model.findOne({ where : { name : name }, include : Database.getModel(PartyInvite.modelName) });
    },
    
    getPartyByLeaderID(leaderID) {
        var model = Database.getModel(this.modelName);
        return model.findOne({ where : { leaderID : leaderID }, include : Database.getModel(PartyInvite.modelName) });
    }
}