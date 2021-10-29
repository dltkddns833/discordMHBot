const config = require('./lib/config')
const help = require('./lib/help')
var async = require('async');
var moment = require('moment');
var mod = require('./login.js');
var search = require('./search.js');

var client = mod.client;
var MessageEmbed = mod.MessageEmbed;
var User = mod.User;
var connection = mod.connection;

function modifyGuide(message){
    var collectorTimeset = 600000
    const guideembed = new MessageEmbed()
    const embed = new MessageEmbed()
    guideembed.setColor('#42f56c');

    async.waterfall([
        function(Callback){
            guideembed.setTitle(help.modifyGuide.guide_1.title);
            guideembed.setDescription(help.modifyGuide.guide_1.content);
            message.channel.send(guideembed);

            var modifyOb = [
                id = "",
                title = "",
                content = "",
                ImageUrl = "",
                thumnail = "",
                fieldtitle1 = "",
                fieldcontent1 = "",
                fieldtitle2 = "",
                fieldcontent2 = "",
                fieldtitle3 = "",
                fieldcontent3 = "",
                tag = ""
            ]
            const filterword = 'modify!';
            const filter = m => m.content.includes(filterword);
            const collector = message.channel.createMessageCollector(filter, { time: collectorTimeset });
            

            collector.on('collect', m => {
                var uploadFilter = m.content.substring(m.content.indexOf(filterword)+filterword.length)
                if (uploadFilter == 'cancel'){
                    collector.stop();
                    message.channel.send('수정을 취소하였습니다.');
                    Callback("업로드 취소", "done");
                }else if(uploadFilter == ''){

                }else{
                    async.waterfall([
                        function(Callback){
                            search.searchGuide(message, uploadFilter, true).then(function(data){
                                Callback(null, data);
                            },function(err){
                                console.log("수정 에러 발생 : 해당 데이터를 불러오지 못했습니다.")
                                Callback("Error", null);
                            })
                        }
                    ], function(err, result){
                        if(result.title != "undefined" && result.title != null && result.title != ''){
                            embed.setTitle(result.title)
                        }
                        if(result.content != "undefined" && result.content != null && result.content != ''){
                            embed.setDescription(result.content)
                        }
                        if(result.thumnail != "undefined" && result.thumnail != null && result.thumnail != ''){
                            embed.setThumbnail(result.thumnail);
                        }
                        if(result.fieldtitle1 != "undefined" && result.fieldtitle1 != null && result.fieldtitle1 != ''){
                            if(result.fieldcontent1 != "undefined" && result.fieldcontent1 != null && result.fieldcontent1 != ''){
                                embed.addField(result.fieldtitle1,result.fieldcontent1);
                            }
                        }
                        if(result.fieldtitle2 != "undefined" && result.fieldtitle2 != null && result.fieldtitle2 != ''){
                            if(result.fieldcontent2 != "undefined" && result.fieldcontent2 != null && result.fieldcontent2 != ''){
                                embed.addField(result.fieldtitle2,result.fieldcontent2);
                            }
                        }
                        if(result.fieldtitle3 != "undefined" && result.fieldtitle3 != null && result.fieldtitle3 != ''){
                            if(result.fieldcontent3 != "undefined" && result.fieldcontent3 != null && result.fieldcontent3 != ''){
                                embed.addField(result.fieldtitle3,result.fieldcontent3);
                            }
                        }
                        if(result.attachfile != "undefined" && result.attachfile != null && result.attachfile != ''){
                            embed.setImage(result.attachfile);
                        }

                        
                        search.tagDecoding(result.tag).then(function(data){
                            embed.setFooter(data + " | " + moment(result.modate).format("YYYY-MM-DD"));
                            result.tag = data
                            collector.stop();
                            Callback(null, result)
                            
                        }, function(err){
                            console.log(err);
                            embed.setFooter(moment(result.modate).format("YYYY-MM-DD"));
                            collector.stop();
                            Callback(null, result)
                        })
                    })
                }
            });

        },
        function(arg, Callback){
            guideembed.setTitle(help.modifyGuide.guide_2.title);
            guideembed.setDescription(help.modifyGuide.guide_2.content);
            guideembed.setImage(help.modifyGuide.guide_2.ImageUrl);
            message.channel.send(guideembed);
            const filterword = 'modify!';
            const filter = m => m.content.includes(filterword);
            const collector = message.channel.createMessageCollector(filter, { time: collectorTimeset });

            var tagString = '';

            collector.on('collect', m => {
                var uploadFilter = m.content.substring(m.content.indexOf(filterword)+filterword.length, m.content.indexOf('='))
                switch(uploadFilter){
                    case 'title':
                        arg.title = m.content.substring(m.content.indexOf('=') + 1);
                        embed.setTitle(arg.title);
                        break;
                    case 'content':
                        arg.content = m.content.substring(m.content.indexOf('=') + 1);
                        embed.setDescription(arg.content);
                        break;
                    case 'url':
                        arg.attachfile = m.content.substring(m.content.indexOf('=') + 1);
                        embed.setImage(arg.attachfile);
                        break;
                    case 'field1':
                        arg.fieldtitle1 = m.content.substring(m.content.indexOf('=') + 1, m.content.indexOf('?'));
                        arg.fieldcontent1 = m.content.substring(m.content.indexOf('?') + 1);
                        embed.addField(arg.fieldtitle1, arg.fieldcontent1);
                        break;
                    case 'field2':
                        arg.fieldtitle2 = m.content.substring(m.content.indexOf('=') + 1, m.content.indexOf('?'));
                        arg.fieldcontent2 = m.content.substring(m.content.indexOf('?') + 1);
                        embed.addField(arg.fieldtitle2, arg.fieldcontent2);
                        break;
                    case 'field3':
                        arg.fieldtitle3 = m.content.substring(m.content.indexOf('=') + 1, m.content.indexOf('?'));
                        arg.fieldcontent3 = m.content.substring(m.content.indexOf('?') + 1);
                        embed.addField(arg.fieldtitle3, arg.fieldcontent3);
                        break;
                    case 'thumnail':
                        arg.thumnail = m.content.substring(m.content.indexOf('=') + 1);
                        embed.setThumbnail(arg.thumnail);
                        break;
                    case 'tag':
                        tagString += m.content.substring(m.content.indexOf('=') + 1) + " ";
                        arg.tag = tagString;
                        embed.setFooter(arg.tag);
                        break;
                    case 'show':
                        message.channel.send(embed);
                        break;
                    case 'ok':
                        collector.stop();
                        Callback(null, arg);
                        break;
                    case 'cancel':
                        collector.stop();
                        Callback("수정 취소", arg);
                        break;
                    default:
                        message.channel.send("유효하지 않은 명령어입니다.");
                        break;
                }
            });
        },
        function(arg, Callback){
            // 태그 작업 (존나 보기싫은 코드)
            var tagstring = arg.tag;
            arg.tag="0,"

            var tagArray = tagstring.split('#');

            tagstring = '';
            tagArray.splice(0,1);
            // 첫번째는 ''이 들어가더라
            for(i = 0; i < tagArray.length; i++){
                // 마지막 띄어쓰기 제거
                tagstring += "'" + tagArray[i].substring(0, tagArray[i].length - 1) + "'";
                tagArray[i] = tagArray[i].substring(0, tagArray[i].length - 1);
                if(i != tagArray.length - 1){
                    tagstring += ','
                }

            }


            var sqlquery = "SELECT id, tag ";
            sqlquery += "from tagtable where tag in (" + tagstring + ")"; 

            //태그 있나 확인
            connection.query(sqlquery, function(err, rows, field){
                if(err){
                    Callback(null, arg);
                }else{
                    // 새로 추가해야할 태그만 남기자
                    for(i = 0; i < tagArray.length; i++){
                        for(j = 0; j < rows.length; j++){
                            if(rows[j].tag == tagArray[i]){
                                // 일단 있는거 객체에 추가
                                arg.tag += rows[j].id + ","
                                tagArray.splice(i,1);
                            }
                        }
                    }

                    //새로운 태그 INSERT
                    if(tagArray.length != 0){
                        sqlquery = "INSERT INTO tagtable(tag) values "
                        tagstring = ""
                        for(i = 0 ; i < tagArray.length ; i++){
                            tagstring += "('" + tagArray[i] + "')";
                            if(i != tagArray.length - 1){
                                tagstring += ','
                            }
                        }
                        sqlquery += tagstring
                        connection.query(sqlquery, function(err, result){
                            if(!err){
                                message.channel.send('새로운 태그 업로드 완료!');
                            }else{
                                Callback(null, arg);
                                message.channel.send('태그 업로드 실패...b\n' + err);
                            }
                            
                            // INSERT 했으니 id값이 몇번인지 찾자..
                            tagstring = ""
                            for(i=0 ; i < tagArray.length ; i++){
                                tagstring += "'" + tagArray[i] + "'";
                                if(i != tagArray.length - 1){
                                    tagstring += ','
                                }
                            }
                            
                            sqlquery = "SELECT id, tag ";
                            sqlquery += "from tagtable where tag in (" + tagstring + ")";
                            
                            connection.query(sqlquery, function(err, rowstag, field){
                                if(err){
                                    Callback(null, arg);
                                }
                                for(i = 0; i < tagArray.length; i++){
                                    for(j = 0; j < rowstag.length; j++){
                                        if(rowstag[j].tag == tagArray[i]){
                                            // 일단 있는거 객체에 추가
                                            arg.tag += rowstag[j].id + ","
                                        }
                                    }
                                }
                                
                                Callback(null, arg);
                            });
                        })
                    }else{
                        Callback(null, arg);
                    }
                }
            })

        }

    ], function(err, result){
        
        
        if(err != null){
            message.channel.send(err);
            return
        }
        //유효성검사
        if(typeof result.content == "undefined" || result.content == null || result.content == ""){
            result.content = ""
        }
        if(typeof result.fieldtitle1 == "undefined" || result.fieldtitle1 == null || result.fieldtitle1 == ""){
            result.fieldtitle1 = ""
        }
        if(typeof result.fieldcontent1 == "undefined" || result.fieldcontent1 == null || result.fieldcontent1 == ""){
            result.fieldcontent1 = ""
        }
        if(typeof result.fieldtitle2 == "undefined" || result.fieldtitle2 == null || result.fieldtitle2 == ""){
            result.fieldtitle2 = ""
        }
        if(typeof result.fieldcontent2 == "undefined" || result.fieldcontent2 == null || result.fieldcontent2 == ""){
            result.fieldcontent2 = ""
        }
        if(typeof result.fieldtitle3 == "undefined" || result.fieldtitle3 == null || result.fieldtitle3 == ""){
            result.fieldtitle3 = ""
        }
        if(typeof result.fieldcontent3 == "undefined" || result.fieldcontent3 == null || result.fieldcontent3 == ""){
            result.fieldcontent3 = ""
        }
        if(typeof result.attachfile == "undefined" || result.attachfile == null || result.attachfile == ""){
            result.attachfile = ""
        }
        if(typeof result.thumnail == "undefined" || result.thumnail == null || result.thumnail == ""){
            result.thumnail = ""
        }

        //엔터키 치환
        result.content = result.content.replace(/\n/g, '||');
        result.content = result.content.replace(/\r/g, '||');
        result.fieldcontent1 = result.fieldcontent1.replace(/\n/g, '||');
        result.fieldcontent1 = result.fieldcontent1.replace(/\r/g, '||');
        result.fieldcontent2 = result.fieldcontent2.replace(/\n/g, '||');
        result.fieldcontent2 = result.fieldcontent2.replace(/\r/g, '||');
        result.fieldcontent3 = result.fieldcontent3.replace(/\n/g, '||');
        result.fieldcontent3 = result.fieldcontent3.replace(/\r/g, '||');


        var sqlquery = "UPDATE attacktable SET title = '" + result.title + "', content = '" + result.content + "', "
        sqlquery += "fieldtitle1 = '" + result.fieldtitle1 + "', fieldcontent1 = '" + result.fieldcontent1 + "', fieldtitle2 = '" + result.fieldtitle2 + "', fieldcontent2 = '" + result.fieldcontent2 + "', fieldtitle3 = '" + result.fieldtitle3 + "', fieldcontent3 = '" + result.fieldcontent3 + "', "
        sqlquery += "attachfile = '" + result.attachfile + "', thumnail = '" + result.thumnail + "', tag = '" + result.tag + "', modate = now() "
        sqlquery += "where id = " + result.id
        connection.query(sqlquery, function(err, res){
            if(!err){
                console.log("수정 요청 : " + result.title);
                message.channel.send('업로드 완료!\n !'+result.title+' 통해 확인해주세요!');
            }else{
                message.channel.send('업로드 실패...\n' + err);
            }
        })
        
    });
}



module.exports.modifyGuide = modifyGuide