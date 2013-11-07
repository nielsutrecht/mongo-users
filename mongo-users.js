var version = "0.0.1";
var mongoose = require('mongoose');
var bcrypt = require("bcrypt-nodejs");
var User;

var userSchema = mongoose.Schema({
    email: String, 
	password: String,
	salt: String,
	name: String,
	roles: []
})

userSchema.methods.validPassword = function( pwd, callback) {
	if(this.password == null)
	{
		callback("User: password empty", null);
		return;
	}
	bcrypt.compare(pwd, this.password, function(error, result){
		callback(error, result);
	});
}

userSchema.methods.hasRole = function(role) {
	return this.roles.indexOf(role) > -1;
}

userSchema.methods.hashPassword = function(callback)
{
	var self = this;
	bcrypt.genSalt(10, function(error, result)
	{
		self.salt = result;
		bcrypt.hash(self.password, self.salt, null, function(error, result)
		{
			self.password = result;
			callback(null, self.password);
		});
	});
}

userSchema.index({ email: 1 }, { unique: true })

exports.addToSchema = function(object)
{
	userSchema.add(object);
}
      
exports.init = function(url)
{
	if(!User)
	{
		mongoose.connect(url);
		User = mongoose.model('User', userSchema);
	}
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
	if(user.password == null)
	{
		user.save();
	}
	else
	{
		user.hashPassword(function(err, pass){
			user.save();
		});
	}
};

exports.delete = function(id)
{
	User.remove({ _id: id }).exec();
};

exports.findByMail = function(email, callback)
{
	User.findOne({ email: email}, callback);
}

exports.find = function(query, callback)
{
	User.find(query, callback);
}

exports.serializeUser = function(user, done) 
{
	console.log("Ser");
  done(null, user._id);
}

exports.deserializeUser = function(id, done) 
{
  User.findById(id, function(err, user) 
  {
	console.log("Des");
    done(err, user);
  });
}

exports.authenticate = function(username, password, done) 
{
    exports.findByMail(username, function (err, user) {
      if (err) { 
		error(err);
		return done(err); 
	  }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
	  user.validPassword(password, function(err, result){
		if (err) { return done(err); }
		if(result)
		{
			return done(null, user);
		}
		else
		{
			return done(null, false, { message: 'Incorrect password.' });		
		}
	  });
    });
  }

function error(error)
{
	console.log(error);
}

