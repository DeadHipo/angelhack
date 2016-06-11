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

userRouter.get('/location', function(req, res) {
	var data = {
		uid: req.query.uid,
		phone_number: req.query.phone_number,
		password: req.query.password
	};

	User.findGeo(data.phone_number, data.password, function(error, data) {
		if (error) {
			return res.json({ error: {code: 1, msg: error} });
		}
		return res.json({response: {geo: data}});
	});
});

userRouter.get('/login', function(req, res) {
	var data = {
		phone_number: req.query.phone_number,
		password: req.query.password
	};

	User.findUser(data.phone_number, data.password function(error, data) {
		if (error) {
			return res.json({error: {code: 1, msg: error}});
		}
		if (data == null) {
			return res.json({error: {code: 2, msg: 'data is null'}});
		}
		return res.json({response: {status: 'success'}});
	});
});

module.exports = userRouter;