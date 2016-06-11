var TelegramBot = require('node-telegram-bot-api');
 
var token = '207033273:AAHbVWRSEaHxjVaLJVFeK1HblUqYy8JiKOk';

var botOptions = {
    polling: true
};

var bot = new TelegramBot(token, botOptions);

bot.getMe().then(function(me)
{
    console.log('Hello! My name is %s!', me.first_name);
    console.log('My id is %s.', me.id);
    console.log('And my username is @%s.', me.username);
});

module.exports = bot;