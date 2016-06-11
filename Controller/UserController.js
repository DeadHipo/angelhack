var express = require('express');
var userRouter = express.Router();

var UserSchema = require('../Model/UserModel').UserSchema;

userRouter.get('/registration', function(req, res) {
	var data = {
			phone_number: req.query.phone_number,
			password: req.query.password
	};

	UserSchema.registration(data.phone_number, data.password, function(error, data) {
		if (error) {
			return res.json({ error: {code: 1, msg: error} });
		}
		return res.json({response: {status: 'succes'}});
	});
});

module.exports = userRouter;