var express = require('express');
var sendPush = require('../Service/PushService').sendPush;
var pushRouter = express.Router();

var User = require('../Model/UserModel').User;

pushRouter.get('/send', function(req, res) {

	console.log(req.query);

	var data = {
		cmd: req.query.token,
		token: req.query.token,
		phone_number: req.query.phone_number,
		password: req.query.password
	};

	User.findUser(data.phone_number, data.password, function(error, document) {
		if (error || document == null) {
			return res.json({error: {code: '1', msg: error}});
		}

		console.log(document);

		sendPush(document._id);
	});
});

module.exports = pushRouter;