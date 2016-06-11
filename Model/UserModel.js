var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	phone_number: {type: Number, index: true },
	password: String
});

UserSchema.statics.registration = function registration(phone_number, password, callback) {
	User.findOneAndUpdate({
		phone_number: phone_number
	}, {
		$set: {
			password: password
		}
	}, {
		upsert: true,
		new: true
	},
	function(error, document) {
		if (error) {
			return callback('1');
		}
		return callback(null, '1');
	});
}

var User = mongoose.model('User', UserSchema);
module.exports.UserSchema = UserSchema;
module.exports.User = User;