var mongoose = require('mongoose');
var express = require('express');
var apn = require('apn');
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
	res.json({status: 1});
});

app.listen(80);


var service = new apn.connection({ production: false });

service.on("connected", function() {
    console.log("Connected");
});

service.on("transmitted", function(notification, device) {
    console.log("Notification transmitted to:" + device.token.toString("hex"));
});

service.on("transmissionError", function(errCode, notification, device) {
    console.error("Notification caused error: " + errCode + " for device ", device, notification);
    if (errCode === 8) {
        console.log("A error code of 8 indicates that the device token is invalid. This could be for a number of reasons - are you using the correct environment? i.e. Production vs. Sandbox");
    }
});

service.on("timeout", function () {
    console.log("Connection Timeout");
});

service.on("disconnected", function() {
    console.log("Disconnected from APNS");
});

service.on("socketError", console.error);

function pushNotificationToMany() {
    console.log("Sending the same notification each of the devices with one call to pushNotification.");
    var note = new apn.notification();
    note.setAlertText("Hello, from node-apn!");
    note.badge = 1;

    service.pushNotification(note, ['f206771db2fdc5860dd734d231dca815d48d6bb33881f8ea6852713ec49fa6a9']);
}

pushNotificationToMany();