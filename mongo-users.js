var version = "0.0.1";
var mongoose = require('mongoose');
var bcrypt = require("bcrypt-nodejs");
var User;

var userSchema = mongoose.Schema({
    email: String, 
	password: String,
	salt: String,
	name: String 
})

userSchema.methods.validPassword = function( pwd, callback) {
	bcrypt.compare(pwd, this.hash, callback);
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
	user.save();
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
  done(null, user._id);
}

exports.deserializeUser = function(id, done) 
{
  User.findById(id, function(err, user) 
  {
    done(err, user);
  });
}

exports.authenticate = function(username, password, done) 
{
	console.log("Login attempt: " + username);
    exports.findByMail(username, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
		console.log("Incorrect username");
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
		console.log("Incorrect password");
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }

function error(error)
{
	console.error(error);
}

