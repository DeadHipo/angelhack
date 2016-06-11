var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	_id: {type: String, index: true},
	phone_number: {type: Number, index: true },
	password: String
});

UserSchema.statics.registration = function registration(uid, phone_number, password, callback) {
	User.findOneAndUpdate({
		_id: uid
	}, {
		$set: {
			phone_number: phone_number,
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