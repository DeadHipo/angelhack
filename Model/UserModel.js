var mongoose = require('mongoose');
var Generator = require('../Helper/generateToken');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	_id: {type: String, index: true },
	phone_number: {type: Number, index: true },
	token: {type: String, index: true },
	password: String
});

UserSchema.statics.registration = function registration(uid, phone_number, password, callback) {
	User.findOneAndUpdate({
		_id: uid
	}, {
		$set: {
			phone_number: phone_number,
			password: password,
			token: Generator(15)
		}
	}, {
		upsert: true,
		new: true
	},
	function(error, document) {
		if (error) {
			return callback(error);
		}
		return callback(null, document);
	});
}

UserSchema.statics.findUser = function findUser(phone_number, password, callback) {
	User.findOne({
		phone_number: phone_number,
		password: password
	}, function(error, document) {
		if (error) {
			return callback(error);
		}
		else if (document.length) {
			return callback(null, null);
		} 
		return callback(null, document);
	});
}

var User = mongoose.model('User', UserSchema);
module.exports.UserSchema = UserSchema;
module.exports.User = User;