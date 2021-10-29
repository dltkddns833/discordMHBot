const config = require('./lib/config')
const Discord = require('discord.js');
const { 
    Client, 
    MessageEmbed,
    User 
} = require('discord.js');
const client = new Discord.Client();
var mysql = require('mysql');


var connection = mysql.createConnection({
    host : config.mysqlconfig.host,
    user : config.mysqlconfig.user,
    password : config.mysqlconfig.password,
    port : config.mysqlconfig.port,
    database : config.mysqlconfig.database,
    charset : 'utf8mb4'
})



connection.connect();
connection.on('error', function(err) {
    console.log(err.code)
    connection.connect();
 })
client.login(config.token);

module.exports.client = client;
module.exports.connection = connection;
module.exports.MessageEmbed = MessageEmbed;
module.exports.User = User;