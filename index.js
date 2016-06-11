var mongoose = require('mongoose');
var express = require('express');
var app = express();

var user = require('./Controller/UserController');

mongoose.connect('mongodb://localhost/db');

var db = mongoose.connection;

db.on('error', function (err) {
    console.log('connection error:', err.message);
});

db.once('open', function callback () {
    console.log("Connected to DB!");
});


app.use('/user', user);

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(80);