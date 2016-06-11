var express = require('express');
var userRouter = express.Router();

var UserSchema = require('../Model/UserModel').UserSchema;
var User = require('../Model/UserModel').User;

userRouter.get('/registration', function(req, res) {
	var data = {
		uid: req.query.uid,
		phone_number: req.query.phone_number,
		password: req.query.password
	};

	User.registration(data.uid, data.phone_number, data.password, function(error, data) {
		if (error) {
			return res.json({ error: {code: 1, msg: error} });
		}
		return res.json({response: {token: data.token}});
	});
});

module.exports = userRouter;