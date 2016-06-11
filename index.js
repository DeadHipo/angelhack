var mongoose = require('mongoose');
var express = require('express');
var app = express();

var user = require('./Controller/UserController');

mongoose.connect('mongodb://localhost/db');

app.use('/user', user);

app.get('/', function (req, res) {
  res.send('Hello World!')
})
 
app.listen(80);