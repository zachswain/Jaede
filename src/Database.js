const Sequelize = require("sequelize");
const fs = require("fs");

class Database {
  static init() {
    if( this._sequelize ) {
        console.log("Database is already initialized");
        return;
    }
    
    this._sequelize = new Sequelize({
    	dialect: 'sqlite',
    	storage: 'database.sqlite',
    	pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
    
    let self=this;
    self._models=[];    
    self._relationships=[];
    
    fs.readdirSync(__dirname + "/models").forEach(function(name){
			var object = require(__dirname + "/models" + "/" + name);
			var options = object.options || {}
			var modelName = name.replace(/\.js$/i, "");
			self._models[modelName] = self._sequelize.define(modelName, object.model, options);
			if("relations" in object){
				self.relationships[modelName] = object.relations;
			}
			console.log("added model " + modelName);
		});
		
		console.log("Database initialized");
  }
  
  
  
  static sync() {
    return this._sequelize.sync({ force : true });
  }
  
  static initialized() {
      return this._sequelize!=null;
  }
  
  static getModel(modelName) {
    console.log(this._models);
    return this._models[modelName];
  }
}

module.exports = Database;