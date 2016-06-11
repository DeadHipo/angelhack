var telegramBot = require('../Service/TelegramService');

var STAGE = {
	START: {
		msg: 'Введите номер телефона и пароль в формате +79999999999 mypassword'
	},
	ENTER: {
		msg: '1 - Получить локацию\n2 - Воспроизвести звук'
	},
	DONE: {
		msg: 'Отправлено'
	}
}
var users;

telegramBot.on('text', function(msg)
{
    var messageChatId = msg.chat.id;
    var messageText = msg.text;
    var messageDate = msg.date;
    var userId = msg.from.id;
 
    if (messageText === '/find') {

		users[userId] = STAGE.START;

        sendMessageByBot(messageChatId, users[userId].msg);
    } else {



        sendMessageByBot(messageChatId, 'Я не знаю таких команд :(');
    }
    
    console.log(msg);
});

function sendMessageByBot(aChatId, aMessage)
{
    telegramBot.sendMessage(aChatId, aMessage, { caption: 'I\'m a cute bot!' });
}