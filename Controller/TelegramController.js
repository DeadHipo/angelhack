var request = require('request');
var User = require('../Model/UserModel').User;

var telegramBot = require('../Service/TelegramService');

var STAGE = {
	HELP: {
		msg: 'Введите /find и следуйте указаниям'
	},
	NULL: {
		msg: 'Я не знаю таких команд :( Введите команду. /help'
	},
	START: {
		msg: 'Введите номер телефона и пароль в формате +79999999999 mypassword'
	},
	COMMAND: {
		msg: '1 - Поиск по локации\n2 - Звуковой сигнал'
	},
	DONE: {
		msg: 'Отправлено'
	},
	ERROR: {
		msg: 'Ошибка'
	}
}
var users = {};

telegramBot.on('text', function(msg)
{
    var messageChatId = msg.chat.id;
    var messageText = msg.text;
    var messageDate = msg.date;
    var userId = msg.from.id.toString();

 	if (!(userId in users)) {
		users[userId] = STAGE.NULL; 		
 	}

    if (messageText === '/find') {
		users[userId] = STAGE.START;
    } else if (messageText === '/help') {
		users[userId] = STAGE.HELP;
    }

	react({
		userId: userId,
		messageText: messageText
	}, function(forUser) {
		sendMessageByBot(messageChatId, forUser);
	});
});

function react(data, callback) {
	switch(users[data.userId]) {
		case STAGE.START: {
			callback(users[data.userId].msg);
			users[data.userId] = STAGE.COMMAND;
			break;
		}
		case STAGE.COMMAND: {
			var userData = data.messageText.split(" ");
			var formUser = {
				phone_number: userData[0],
				password: userData[1]
			}

			console.log(formUser);

			User.findUser(formUser.phone_number, formUser.password, function(error, document) {
				if (error || document == null) {
					console.log(error, document);
					users[data.userId] = STAGE.ERROR;
					callback(users[data.userId].msg);
				} else {
					users[data.userId] = STAGE.COMMAND;
					callback(users[data.userId].msg);
					users[data.userId] = STAGE.DONE;
				}
			});
			break;
		}
		case STAGE.DONE: {

		}
		case STAGE.ERROR: {
			users[userId] = STAGE.NULL;
		}
		default: {
			callback(users[data.userId].msg);
		}
	}
}


function sendMessageByBot(aChatId, aMessage)
{
    telegramBot.sendMessage(aChatId, aMessage, { caption: 'I\'m a cute bot!' });
}