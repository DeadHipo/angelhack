var express = require('express');
var sendPush = require('../Service/PushService').sendPush;
var pushRouter = express.Router();

var User = require('../Model/UserModel').User;

pushRouter.get('/send', function(req, res) {
	var data = {
		phone_number: req.query.phone_number,
		password: req.query.password
	};

	data.phone_number = data.phone_number.trim();
	data.phone_number = "+" + data.phone_number;

	User.findUser(data.phone_number, data.password, function(error, document) {
		if (error || document == null) {
			return res.json({error: {code: '1', msg: error}});
		}
		sendPush(document.device_id);
		res.json({response: {status: 'send'}});
	});
});

module.exports = pushRouter;