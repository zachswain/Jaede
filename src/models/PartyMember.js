module.exports = {
    modelName : "PartyMember"
};

const Sequelize = require("sequelize");
const Database = require("../Database.js");

const Character = require("./Character.js");
const Party = require("./Party.js");

module.exports = {
    modelName : "PartyMember",
    model : {
        userID : {
            type : Sequelize.STRING,
    	    allowNull : false
        },
        isLeader : {
            type : Sequelize.BOOLEAN,
            allowNull : false,
            defaultValue : false
        }
    },
    relationships : [
        { modelName : Party.modelName, relationship : "belongsTo" }
    ],
    
    create(args) {
        var model = Database.getModel(this.modelName);
        return model.create(args);
    },
    
    getByUserIDAndPartyID(userID, partyID) {
        var model = Database.getModel(this.modelName);
        return model.findOne({ where : {
            [Sequelize.Op.and] : [
                {
                    userID : userID
                },
                {
                    PartyID : partyID
                }
            ]
        }})
    }
}