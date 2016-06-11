var request = require('request');
var User = require('../Model/UserModel').User;

var telegramBot = require('../Service/TelegramService');

const STAGE = {
	NULL: {
		num: 0,
		msg: 'Я не знаю таких команд :( Введите команду. /help'
	},
	HELP: {
		num: 1,
		msg: 'Введите /find и следуйте указаниям'
	},
	PHONE: {
		num: 2,
		msg: 'Введите номер телефона в формате +79516602639'
	},
	PASSWORD: {
		num: 3,
		msg: 'Введите пароль для поиска устройства'
	},
	COMMAND: {
		num: 4,
		msg: '1 - Поиск по локации\n2 - Звуковой сигнал'
	},
	SIGNAL: {
		num: 5,
		msg: 'Сигнал отправлен на устройство'
	},
	LOCATION: {
		num: 6,
		msg: 'Последняя геолокация устройства'
	},
	LOGIN_ERROR: {
		num: 7,
		msg: 'Неверная связка логина или пароля'
	},
	COMMAND_ERROR: {
		num: 8,
		msg: 'Неверная команда'
	}
}
/*
{
	stage: STAGE,
	phone_number: phone,
	password: password,
	device: device,

}
*/
var users = {};



telegramBot.on('text', function(msg)
{
    var messageChatId = msg.chat.id;
    var messageText = msg.text;
    var messageDate = msg.date;
    var userId = msg.from.id.toString();

 	if (!(userId in users)) {
		users[userId] = {
			stage: STAGE.NULL,
			phone_number: "null",
			password: "null",
			command: "null",
			device: "null",
		}		
 	}

    if (messageText === '/find') {
		sendMessageByBot(messageChatId, "Введите номер телефона в формате +79516602639");
		users[userId].stage = STAGE.PHONE;
		return;
    } else if (messageText === '/help') {
    	console.log("help");
		users[userId].stage = STAGE.HELP;
		console.log(users[userId].stage);
    }

    console.log("0 " + users[userId].stage);
	react(userId, messageText, function(data) {
		users[userId] = data;
		console.log("1 " + users[userId].stage);
		sendMessageByBot(messageChatId, users[userId].stage.msg);
	});
});

function react(userId, msg, callback) {
	var data = users[userId];
	switch(data.stage) {
		case STAGE.PHONE: {
			data.phone_number = msg;
			data.stage = STAGE.PASSWORD;
			callback(data);
			break;
		}
		case STAGE.PASSWORD: {
			data.password = msg;
			data.stage = STAGE.COMMAND;
			callback(data);
			break;
		}
		case STAGE.COMMAND: {
			data.command = msg;
			if (msg == 1) {
				data.stage = STAGE.LOCATION;
			} else if (msg == 2) {
				data.stage = STAGE.SIGNAL;
			} else {
				data.stage = STAGE.COMMAND_ERROR;
			}
			callback(data);
			break;
		}
		case STAGE.SIGNAL: {
			data.stage = STAGE.NULL;
			callback(data);
			break;
		}
		case STAGE.LOCATION: {
			data.stage = STAGE.NULL;
			callback(data);
			break;
		}
		case STAGE.LOGIN_ERROR: {
			data.stage = STAGE.NULL;
			callback(data);
			break;
		}
		case STAGE.HELP: {
			data.stage = STAGE.HELP;
			callback(data);
			break;
		}
		case STAGE.NULL: {
			callback(data);
			break;
		}
		default: {
			callback(data);
			break;
		}
	}
}


function sendMessageByBot(aChatId, aMessage)
{
    telegramBot.sendMessage(aChatId, aMessage, { caption: 'I\'m a cute bot!' });
}