const config = require('./lib/config')
const help = require('./lib/help')
var async = require('async');
// 내가만든 모듈
var mod = require('./login.js');
var search = require('./search.js');
var upload = require('./upload.js');
var modify = require('./modify.js');

var client = mod.client;
var MessageEmbed = mod.MessageEmbed;
var User = mod.User;
var connection = mod.connection;

client.on('ready', () => {
  console.log('봇이 켜졌습니다.')
})


// ! 메세지(정확한검색, 명령어)
client.on('message', (message) => { // message는 bot이 읽을 수 있는 서버에서 발생하는 이벤트 (Callback)
    //if(message.channel.type == 'dm') return
    if(!message.content.startsWith(config.prefix)) return

    // Embed 사용
    // over at https://discord.js.org/#/docs/main/master/class/MessageEmbed
    if (message.content === config.prefix + 'help') {
        const embed = new MessageEmbed()
        .setTitle(help.helpGuide.guide_1.title)
        .setColor("#4287f5")
        .setDescription(help.helpGuide.guide_1.content);
        message.channel.send(embed);
        return
    }


    // 검색
    //search.js
    search.searchGuide(message,message.content,false);

    return

})

// $ 메세지(업로드, 수정)
// POST(DM을 통해서만 하자)
client.on('message', (message) => {
    if(!message.content.startsWith(config.prefixpost)) return
    
    var messageContent = message.content;
    var messageArray = messageContent.split('/');
    var orderMessage = messageArray[0];

    var collectorTimeset = 600000
    const guideembed = new MessageEmbed()
    const embed = new MessageEmbed()
    guideembed.setColor('#42f56c');
    

    
    // 명령어 insert
    if(orderMessage == config.prefixpost + 'upload'){
        if(message.channel.type != 'dm'){
            message.channel.send('업로드는 DM을 통해서만 가능합니다.');
            return
        }

        upload.uploadGuide(message);
    }

    // 수정
    if(orderMessage == config.prefixpost + 'modify'){
        if(message.channel.type != 'dm'){
            message.channel.send('수정은 DM을 통해서만 가능합니다.');
            return
        }

        modify.modifyGuide(message);
        
    }

})

// $ 메세지(태그검색)
client.on('message', (message) => {
    if(!message.content.startsWith(config.prefixtag)) return
    
    search.searchTag(message,message.content);
})


client.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.cache.find(ch => ch.name === 'member-log');
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(`Welcome to the server, ${member}`);
});
 

