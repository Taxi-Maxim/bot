const {Sequelize} = require('sequelize');

module.exports = new Sequelize( //подключаем бд
    "telega_bot", // название бд
    "root", // имя пользователя 
    "root", // пароль
    {
        host: "master.ef0ba2cf-baf5-46ea-86ec-8040d4576373.c.dbaas.selcloud.ru", // IP адресс сервера
        port: "5432",
        dialect: "postgres"
    }
)