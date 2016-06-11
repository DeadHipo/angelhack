var express = require('express');
var app = express();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/db');

app.get('/', function (req, res) {
  res.send('Hello World!')
})
 
app.listen(80);