const config = require('./lib/config')
var async = require('async');
var moment = require('moment');
var mod = require('./login.js');

var client = mod.client;
var MessageEmbed = mod.MessageEmbed;
var User = mod.User;
var connection = mod.connection;

let searchGuide = function(message, msg, isReturnBool){
    //var searchMessage = msg.substring(message.content.indexOf(config.prefix)+1);
    var searchMessage = msg;
    var index = 0;
    var ischoice = false;
    var isReturn = isReturnBool;
    // 복수 선택 파라미터 = 찾기
    if(searchMessage.indexOf('=') != -1){
        index = searchMessage.substring(searchMessage.indexOf('=')+1) - 1;
        searchMessage = msg.substring(searchMessage.indexOf(config.prefix)+1,searchMessage.indexOf('='));
        ischoice = true;
        if(index == "undefined" || index == null || index == '' || index < 0){
            index = 0;
        }
    }else{
        ischoice = false;
        searchMessage = msg.substring(searchMessage.indexOf(config.prefix)+1);
    }

    var sqlquery = "SELECT id, userid, title, replace(content,'||',char(10)) as content, attachfile, thumnail, ";
    sqlquery += "fieldtitle1, replace(fieldcontent1,'||',char(10)) as fieldcontent1, fieldtitle2, replace(fieldcontent2,'||',char(10)) as fieldcontent2, fieldtitle3, replace(fieldcontent3,'||',char(10)) as fieldcontent3, ";
    sqlquery += "tag, modate from attacktable where title = '" + searchMessage + "'"; 

    //Promise 사용...ㅠㅠㅠ 삽질 시발
    return new Promise((resolve, reject)=> {
        connection.query(sqlquery, function(err, rows, field){
            var rowsCount = rows.length;
            //검색결과가 1개일 때, 복수 선택 초이스 되었을 때
            if(!err && (rowsCount == 1 || ischoice) && rowsCount != 0){
                var resultContent = rows[index].content;
                var userInfo;
                const embed = new MessageEmbed()
                async.waterfall([
                    function(Callback){
                        client.users.fetch(rows[index].userid).then(user => {
                            //message.reply('작성자 : ' + user.toString());
                            embed.setColor(0xff0000)
                            embed.setAuthor(user.tag,user.avatarURL())
                            console.log('(Module)' + user.tag + ' : ' + searchMessage);
                            Callback(null, user)
                        })
                        .catch(() => {
                            message.channel.send('Could not find user with the given ID.');
                            Callback("ERROR!!", null)
                        })
                    },
                    function(arg, Callback){
                        if(err != null){ return }
                        if(rows[index].title != "undefined" && rows[index].title != null && rows[index].title != ''){
                            embed.setTitle(rows[index].title)
                        }
                        if(rows[index].content != "undefined" && rows[index].content != null && rows[index].content != ''){
                            embed.setDescription(resultContent)
                        }
                        if(rows[index].thumnail != "undefined" && rows[index].thumnail != null && rows[index].thumnail != ''){
                            embed.setThumbnail(rows[index].thumnail);
                        }
                        if(rows[index].fieldtitle1 != "undefined" && rows[index].fieldtitle1 != null && rows[index].fieldtitle1 != ''){
                            if(rows[index].fieldcontent1 != "undefined" && rows[index].fieldcontent1 != null && rows[index].fieldcontent1 != ''){
                                embed.addField(rows[index].fieldtitle1,rows[index].fieldcontent1);
                            }
                        }
                        if(rows[index].fieldtitle2 != "undefined" && rows[index].fieldtitle2 != null && rows[index].fieldtitle2 != ''){
                            if(rows[index].fieldcontent2 != "undefined" && rows[index].fieldcontent2 != null && rows[index].fieldcontent2 != ''){
                                embed.addField(rows[index].fieldtitle2,rows[index].fieldcontent2);
                            }
                        }
                        if(rows[index].fieldtitle3 != "undefined" && rows[index].fieldtitle3 != null && rows[index].fieldtitle3 != ''){
                            if(rows[index].fieldcontent3 != "undefined" && rows[index].fieldcontent3 != null && rows[index].fieldcontent3 != ''){
                                embed.addField(rows[index].fieldtitle3,rows[index].fieldcontent3);
                            }
                        }
                        if(rows[index].attachfile != "undefined" && rows[index].attachfile != null && rows[index].attachfile != ''){
                            embed.setImage(rows[index].attachfile)
                        }

                        tagDecoding(rows[index].tag).then(function(data){
                            embed.setFooter(data + " | " + moment(rows[index].modate).format("YYYY-MM-DD"));
                            message.channel.send(embed);
                            Callback(null, arg)
                            
                        }, function(err){
                            console.log(err);
                            embed.setFooter(moment(rows[index].modate).format("YYYY-MM-DD"));
                            message.channel.send(embed);
                            Callback(null, arg)
                        })
                    }
                ], function(err, result){
                    if(isReturn){
                        resolve(rows[index]);
                    }
                })
            }else if(!err && rowsCount > 1){
                SearchManyGuide(message, rows, rowsCount);
            }else{
                message.channel.send('일치하는 검색 결과가 없습니다!\n해당 가이드를 추가해주세요!!:wink:');
            }
        })

    })
}

let searchTag = function(message, tag){
    var searchTagMessage = tag;
    if(searchTagMessage == ''){
        message.channel.send('태그를 입력해주세요!');
        return;
    }
    searchTagMessage = searchTagMessage.substring(searchTagMessage.indexOf(config.prefixtag)+1);

    var sqlquery = "SELECT id, tag ";
    sqlquery += "from tagtable where tag = '" + searchTagMessage + "'"; 

    return new Promise((resolve, reject)=>{

        async.waterfall([
            function(Callback){
                connection.query(sqlquery, function(err, rows, field){
                    if(!err && rows.length != 0){
                        Callback(null, rows[0]);
                    }else{
                        Callback("일치하는 태그가 없습니다. ", "Error");
                    }
                });
            },
            function(args, Callback){
                sqlquery = "SELECT id, userid, title, replace(content,'||',char(10)) as content, thumnail, tag, modate ";
                sqlquery += "from attacktable where tag like '%," + args.id + ",%'"; 
                connection.query(sqlquery, function(err, rows, field){
                    if(!err && rows.length != 0){
                        Callback(null, rows);
                    }else{
                        Callback("일치하는 태그가 없습니다. ", "Error");
                    }
                })
            }
        ], function(err, result){
            if(err != null){
                message.channel.send(err);
                return;
            }
            SearchManyGuide(message, result, result.length);
        });
    })
}


function SearchManyGuide(message, rows, count){
    message.channel.send(count + '개의 검색 결과가 있습니다.');
    // 아닠ㅋㅋㅋ 유저 프로필 가져오려 했는데 루틴이 너무 느려서 할꺼면 aysnc 로 해야함...(귀찮..)
    // aysnc 해도 안되는건 머냐
    for(var i = 0 ; i < count ; i++){
        var embed =new MessageEmbed();
        embed.setColor(0xff0000);
        embed.setAuthor('검색 번호 : ' + (i + 1));
        if(rows[i].title != "undefined" && rows[i].title != null && rows[i].title != ''){
            embed.setTitle(rows[i].title)
        }
        if(rows[i].content != "undefined" && rows[i].content != null && rows[i].content != ''){
            embed.setDescription(rows[i].content)
        }
        if(rows[i].thumnail != "undefined" && rows[i].thumnail != null && rows[i].thumnail != ''){
            embed.setThumbnail(rows[i].thumnail);
        }
        embed.setFooter(rows[i].modate);
        message.channel.send(embed);
    }
    message.channel.send('자세한 해당 가이드를 보려면 !' + rows[0].title + '=[검색 번호] 를 입력해주세요!');
}

function tagDecoding(tag){
    var test = tag.substring(0, tag.length - 1);

    var sqlquery = "SELECT id, tag ";
    sqlquery += "from tagtable where id in (" + test + ")"; 

    return new Promise((resolve, reject)=>{
        async.waterfall([
            function(Callback){
                connection.query(sqlquery, function(err, rows, field){
                    if(!err & rows.length != 0){
                        Callback(null, rows)
                    }else if(rows.length == 0){
                        Callback("Not Include", "tag");
                    }
                    else{
                        Callback("Error", "tag");
                    }
                });
            },
            function(args, Callback){
                var tagname = ''
                for(i=0; i<args.length; i++){
                    tagname+= "#" + args[i].tag + " "
                }
                Callback(null, tagname);
            }
            
        ], function(err, result){
            if(err != null){
                if(err == "Not Include"){
                    reject("태그 없음");
                }else{
                    reject("Error Tag");
                }
            }
            resolve(result);
        })
    })
}


module.exports.searchGuide = searchGuide;
module.exports.searchTag = searchTag;
module.exports.tagDecoding = tagDecoding;
