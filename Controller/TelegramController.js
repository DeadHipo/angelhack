var request = require('request');
var User = require('../Model/UserModel').User;
var sendPush = require('../Service/PushService').sendPush;
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

telegramBot.on('text', function(msg) {
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
			device: null,
		}		
 	}

    if (messageText === '/find') {
		sendMessageByBot(messageChatId, "Введите номер телефона в формате +79516602639");
		users[userId].stage = STAGE.PHONE;
		return;
    } else if (messageText === '/help') {
    	sendMessageByBot(messageChatId, "Введите /find и следуйте указаниям");
		users[userId].stage = STAGE.NULL;
		return;
    }

	react(userId, messageText, function(data, loc) {
		users[userId] = data;
		if (!loc) {
			sendMessageByBot(messageChatId, users[userId].stage.msg);
		} else {
			sendLocationMessageByBot(messageChatId, loc.lat, loc.long);
		}
	});
}).on('contact', function(msg) {
	console.log(msg)
    var messageChatId = msg.chat.id;
    var userId = msg.from.id.toString();

	if (!(userId in users)) {
		return sendMessageByBot(messageChatId, "Введите /find и следуйте указаниям");	
	} else if (users[userId].stage != STAGE.PHONE) {
		return sendMessageByBot(messageChatId, "Ошибка");
	}

	var msg = msg.contact.phone_number;
	react(userId, msg, function(data, loc) {
		users[userId] = data;
		if (!loc) {
			sendMessageByBot(messageChatId, users[userId].stage.msg);
		} else {
			sendLocationMessageByBot(messageChatId, loc.lat, loc.long);
		}
	});
}).on('sticker', function(msg) {
	editMessageReplyMarkup(JSON.stringify({
         one_time_keyboard: true,
          keyboard: [['test']]
    }));
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

			if (!data.device) {
				User.findUser(data.phone_number, data.password, function(error, document) {
					if (error || document == null) {
						data.stage = STAGE.LOGIN_ERROR;
					} else {
						data.device = document;
						data.stage = STAGE.COMMAND;
					}
					callback(data);
				});
			} else {
				callback(data);
			}

			break;
		}
		case STAGE.COMMAND: {
			data.command = msg;
			if (msg == 1) {
				data.stage = STAGE.COMMAND;
				User.findGeo(data.phone_number, data.password, function(error, loc) {
					callback(data, loc);
				});
			} else if (msg == 2) {
				data.stage = STAGE.COMMAND;
				sendPush(data.device.device_id);
				callback(data);
			} else {
				data.stage = STAGE.COMMAND_ERROR;
				callback(data);
			}
			break;
		}
		case STAGE.SIGNAL: {
			data.stage = STAGE.COMMAND;
			callback(data);
			break;
		}
		case STAGE.LOCATION: {
			data.stage = STAGE.COMMAND;
			callback(data);
			break;
		}
		case STAGE.LOGIN_ERROR: {
			data.stage = STAGE.NULL;
			callback(data);
			break;
		}
		case STAGE.COMMAND_ERROR: {
			data.stage = STAGE.NULL;
			callback(data);
			break;
		}
		case STAGE.HELP: {
			data.stage = STAGE.NULL;
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


function sendMessageByBot(aChatId, aMessage) {
    telegramBot.sendMessage(aChatId, aMessage, { caption: 'I\'m a cute bot!' });
}

function sendLocationMessageByBot(aChatId, latitude, longitude) {
	telegramBot.sendLocation(aChatId, latitude, longitude, { caption: 'I\'m a cute bot!' });
}

function editMessageReplyMarkup(aChatId, replyMarkup) {
	telegramBot.editMessageReplyMarkup(replyMarkup);
}