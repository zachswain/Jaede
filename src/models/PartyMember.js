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
        }
    },
    relationships : [
        { modelName : Party.modelName, relationship : "belongsTo" }
    ],
    
    create(args) {
        var model = Database.getModel(this.modelName);
        return model.create(args);
    }
}