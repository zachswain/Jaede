const Sequelize = require("sequelize");
const Config = require("./Config.js");
const fs = require("fs");

class Database {
  static init() {
    if( this._sequelize ) {
        console.log("Database is already initialized");
        return;
    }
    
    this._sequelize = new Sequelize({
    	dialect: 'sqlite',
    	storage: Config.database.location,
    	logging : Config.database.logging,
    	pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
      }
    });
    
    let self=this;
    self._models=[];    
    var relationships=[];
    
    fs.readdirSync(__dirname + "/models").forEach(function(name){
			var object = require(__dirname + "/models" + "/" + name);
			var options = object.options || {}
			var modelName = object.modelName || name.replace(/\.js$/i, "");
			self._models[modelName] = self._sequelize.define(modelName, object.model, options);
			if("relationships" in object){
				relationships.push({
				  modelName : modelName,
				  relationships : object.relationships
				});
			}
			console.log("added model " + modelName);
		});

		relationships.forEach(relationship  => {
		  var source = this._models[relationship.modelName];

		  relationship.relationships.forEach(relatedTo => {
		    var target = this._models[relatedTo.modelName];

		    switch( relatedTo.relationship ) {
		      case "hasOne":
		        source.hasOne(target);
		        break;
		      case "hasMany":
		        source.hasMany(target, {sourceKey:"id"});
		        break;
		      case "belongsTo":
		        source.belongsTo(target);
		        break;
		    }
		    
		    console.log("added relationship, " + source.name + " " + relatedTo.relationship + " " + target.name);
		  })
		});
		
		console.log("Database initialized");
  }
  
  static sync() {
    return this._sequelize.sync({ alter : true });
  }
  
  static initialized() {
      return this._sequelize!=null;
  }
  
  static getModel(modelName) {
    return this._models[modelName];
  }
}

module.exports = Database;