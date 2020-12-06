module.exports = {
    modelName : "PartyInvite"
};

const Sequelize = require("sequelize");
const Database = require("../Database.js");

const Character = require("./Character.js");
const Party = require("./Party.js");

module.exports = {
    modelName : "PartyInvite",
    model : {
        userID : {
            type : Sequelize.STRING,
    	    allowNull : false
        }
    },
    relationships : [
        { modelName : Party.modelName, relationship : "belongsTo" }
    ],
    options : {
        indexes : [
            {
                name : "userID_PartyId_unique",
                unique : true,
                fields : ["userID", "PartyId"]
            }
        ]
    },
    
    create(args, options=null) {
        var model = Database.getModel(this.modelName);
        return model.create(args, options);
    },
    
    getPartyInviteByUserID(userID) {
        var model = Database.getModel(this.modelName);
		return model.findOne({ where : { userID : userID } });
    }
}