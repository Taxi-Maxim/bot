const TelegramApi = require('node-telegram-bot-api');
const { gameOptions, againOptions } = require('./options');
const sequelize = require('./db');
const UserModel = require('./models');

const token = "6757663402:AAHCHpJcoqhaR8p-9CB_9X2aEjQy2ubSO1A";

const bot = new TelegramApi(token, { polling: true });

const chats = {}


bot.setMyCommands([
    { command: "/start", description: "Начальное приветствие" },
    { command: "/info", description: "Информация о пользователе" },
    { command: "/game", description: "Угадай число" },
]);

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, "Я загадал цифру от 1 до 9, попробуй её угадать!")
    const randomNum = Math.floor(Math.random() * 10);
    chats[chatId] = randomNum;
    await bot.sendMessage(chatId, "Отгадывай!", gameOptions);
};

const start = async () => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log("Пизда бд", e);
    }

    bot.on("message", async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        try {
            if (text === "/start") {
                await UserModel.create({chatId});
                await bot.sendSticker(chatId, "https://tlgrm.eu/_/stickers/7a0/e2e/7a0e2ef1-ff94-4317-a188-4bead80d1756/192/2.webp");
                return bot.sendMessage(chatId, `Добро пожаловать, ${msg.from.first_name}`);
            }

            if (text === "/info" && msg.from.first_name != undefined && msg.from.last_name != undefined) {
                const user = await UserModel.findOne({chatId});
                return bot.sendMessage(chatId, `Тебя зовут: ${msg.from.first_name} ${msg.from.last_name}, У тебя правильных ответов: ${user.right}, а неправильных: ${user.wrong}`);
            } else if (text === "/info" && msg.from.first_name != undefined && msg.from.last_name == undefined) {
                const user = await UserModel.findOne({chatId});
                return bot.sendMessage(chatId, `Тебя зовут: ${msg.from.first_name}, У тебя правильных ответов: ${user.right}, а неправильных: ${user.wrong}`);
            }

            if (text === "/game") {
                return startGame(chatId);
            }
            return bot.sendMessage(chatId, "Нормально разговаривай!");

        } catch (e) {
            return bot.sendMessage(chatId, "Пиздец!");
        }

    });

    bot.on("callback_query", async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;

        if (data == "/again") {
            return startGame(chatId);
        }
        if (data == chats[chatId]) { 
            return bot.sendMessage(chatId, `Поздравляю, ты отгадал!`, againOptions)
        } else {
            return bot.sendMessage(chatId, `Ты лузер, бот загадал цифру ${chats[chatId]}`, againOptions)
        }

    })
};

start();