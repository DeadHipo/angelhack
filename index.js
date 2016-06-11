var mongoose = require('mongoose');
var express = require('express');
var app = express();

var user = require('./Controller/UserController');
var push = require('./Controller/PushController');
var telegram = require('./Controller/telegramController');

mongoose.connect('mongodb://localhost/db');

var db = mongoose.connection;

db.on('error', function (err) {
    console.log('connection error:', err.message);
});

db.once('open', function callback () {
    console.log("Connected to DB!");
});


app.use('/user', user);
app.use('/push', push);

app.get('/', function (req, res) {
	res.json({status: 1});
});

app.listen(80);