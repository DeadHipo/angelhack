var express = require('express');
var app = express();

var user = require('./Controller/UserController');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/db');

app.use('/user', user);

app.get('/', function (req, res) {
  res.send('Hello World!')
})
 
app.listen(80);