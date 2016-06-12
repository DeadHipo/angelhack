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
		msg: 'Введите номер телефона в формате +7XXXXXXXXXX или отправьте контакт'
	},
	PASSWORD: {
		num: 3,
		msg: 'Введите пароль для поиска устройства'
	},
	COMMAND: {
		num: 4,
		msg: 'Выберите действие'
	},
	SIGNAL: {
		num: 5,
		msg: 'Звуковой сигнал отправлен на устройство'
	},
	LOCATION: {
		num: 6,
		msg: 'Последнее местоположение устройства'
	},
	LOGIN_ERROR: {
		num: 7,
		msg: 'Неверная пара логин / пароль'
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


 		var keys = [["Местоположение"], ["Звуковой сигнал"]];

		users[userId] = {
			stage: STAGE.NULL,
			phone_number: "null",
			password: "null",
			command: "null",
			device: null,
			replyMarkup: {
				keyboard: keys
			}
		}		
 	}

    if (messageText === '/find') {
		sendMessageByBot(messageChatId, "Введите номер телефона в формате +7XXXXXXXXXX или отправьте контакт", { hide_keyboard: true });
		users[userId].device = null;
		users[userId].stage = STAGE.PHONE;
		return;
    } else if (messageText === '/help' || messageText === '/start') {
    	sendMessageByBot(messageChatId, "Введите /find для использования сервиса", { hide_keyboard: true });
		users[userId].stage = STAGE.NULL;
		return;
    }

	react(userId, messageText, function(data, loc, more) {
		if (more) {
			sendMessageByBot(messageChatId, more);
		}
		users[userId] = data;
		if (data.stage == STAGE.COMMAND) {
			if (loc) {
				sendLocationMessageByBot(messageChatId, loc.lat, loc.long);
				return;
			}
			sendMessageByBot(messageChatId, users[userId].stage.msg, data.replyMarkup);
			return;
		}
		if (!loc) {
			sendMessageByBot(messageChatId, users[userId].stage.msg);
		} else {
			console.log(loc);
			sendLocationMessageByBot(messageChatId, loc.lat, loc.long);
		}
	});
}).on('contact', function(msg) {
    var messageChatId = msg.chat.id;
    var userId = msg.from.id.toString();

	if (!(userId in users)) {
		return sendMessageByBot(messageChatId, "Введите /find и следуйте указаниям");	
	} else if (users[userId].stage != STAGE.PHONE) {
		return sendMessageByBot(messageChatId, "Ошибка");
	}

	var msg = msg.contact.phone_number;
	react(userId, msg, function(data, loc, more) {
		if (more) {
			sendMessageByBot(messageChatId, more);
		}
		users[userId] = data;
		console.log(users[userId].stage == STAGE.COMMAND);
		if (users[userId].stage == STAGE.COMMAND) {
			if (loc) {
				sendLocationMessageByBot(messageChatId, loc.lat, loc.long);
				return;
			}
			sendMessageByBot(messageChatId, users[userId].stage.msg, data.replyMarkup);
			return;
		}
		if (!loc) {
			sendMessageByBot(messageChatId, users[userId].stage.msg);
		} else {
			sendLocationMessageByBot(messageChatId, loc.lat, loc.long);
		}
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
				data.stage = STAGE.COMMAND;
				callback(data);
			}

			break;
		}
		case STAGE.COMMAND: {
			data.command = msg;
			if (msg == "Местоположение") {
				data.stage = STAGE.COMMAND;
				User.findGeo(data.phone_number, data.password, function(error, loc) {
					return callback(data, loc, "Последнее местоположение устройства");
				});
			} else if (msg == "Звуковой сигнал") {
				data.stage = STAGE.COMMAND;
				sendPush(data.device.device_id);
				return callback(data, null, "Звуковой сигнал отправлен");
			} else {
				data.stage = STAGE.COMMAND_ERROR;
				return callback(data);
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


function sendMessageByBot(aChatId, aMessage, keyboard) {
    telegramBot.sendMessage(aChatId, aMessage, keyboard);
}

function sendLocationMessageByBot(aChatId, latitude, longitude) {
	telegramBot.sendLocation(aChatId, latitude, longitude);
}

function editMessageReplyMarkup(aChatId, replyMarkup) {
	telegramBot.editMessageReplyMarkup(replyMarkup);
}