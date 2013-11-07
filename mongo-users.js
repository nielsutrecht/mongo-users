var version = "0.0.1";
var mongoose = require('mongoose');
var User;

var userSchema = mongoose.Schema({
    email: String, 
	password: String,
	name: String 
})

userSchema.index({ email: 1 }, { unique: true })


exports.addToSchema = function(object)
{
	userSchema.add(object);
}
       
exports.init = function(url)
{
	mongoose.connect(url);
	User = mongoose.model('User', userSchema);
};

exports.getVersion = function () {
	return version;
};

exports.create = function(user, callback)
{
	var userObj = new User(user);
	userObj.save(function(error, user, numaffected)
	{
		callback(error, user);
	});	
};

exports.get = function(id, callback)
{
	User.findById(id).exec(callback);
}

exports.update = function(user)
{

};

exports.delete = function(id)
{
	User.remove({ _id: id }).exec();
};

exports.findByMail = function(email, callback)
{
	User.findOne({ email: email}, callback);
}



function error(error)
{
	console.error(error);
}

