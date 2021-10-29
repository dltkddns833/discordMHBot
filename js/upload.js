const config = require('./lib/config')
const help = require('./lib/help')
var async = require('async');
var mod = require('./login.js');

var client = mod.client;
var MessageEmbed = mod.MessageEmbed;
var User = mod.User;
var connection = mod.connection;

function uploadGuide(message){
    var collectorTimeset = 600000
    const guideembed = new MessageEmbed()
    const embed = new MessageEmbed()
    guideembed.setColor('#42f56c');

    var uploadOb = [
        title = "",
        content = "",
        ImageUrl = "",
        thumnail = "",
        field1title = "",
        field1content = "",
        field2title = "",
        field2content = "",
        field3title = "",
        field3content = "",
        tag = ""
    ]

    async.waterfall([
        function(Callback){
            guideembed.setTitle(help.uploadGuide.guide_1.title);
            guideembed.setDescription(help.uploadGuide.guide_1.content);
            guideembed.setImage(help.uploadGuide.guide_1.ImageUrl);
            message.channel.send(guideembed);

            const filterword = 'upload!';
            const filter = m => m.content.includes(filterword);
            const collector = message.channel.createMessageCollector(filter, { time: collectorTimeset });

            var tagString = '';
            

            collector.on('collect', m => {
                var uploadFilter = m.content.substring(m.content.indexOf(filterword)+filterword.length, m.content.indexOf('='))
                switch(uploadFilter){
                    case 'title':
                        uploadOb.title = m.content.substring(m.content.indexOf('=') + 1);
                        embed.setTitle(uploadOb.title);
                        break;
                    case 'content':
                        uploadOb.content = m.content.substring(m.content.indexOf('=') + 1);
                        embed.setDescription(uploadOb.content);
                        break;
                    case 'url':
                        uploadOb.ImageUrl = m.content.substring(m.content.indexOf('=') + 1);
                        embed.setImage(uploadOb.url);
                        break;
                    case 'field1':
                        uploadOb.field1title = m.content.substring(m.content.indexOf('=') + 1, m.content.indexOf('?'));
                        uploadOb.field1content = m.content.substring(m.content.indexOf('?') + 1);
                        embed.addField(uploadOb.field1title, uploadOb.field1content);
                        break;
                    case 'field2':
                        uploadOb.field2title = m.content.substring(m.content.indexOf('=') + 1, m.content.indexOf('?'));
                        uploadOb.field2content = m.content.substring(m.content.indexOf('?') + 1);
                        embed.addField(uploadOb.field2title, uploadOb.field2content);
                        break;
                    case 'field3':
                        uploadOb.field3title = m.content.substring(m.content.indexOf('=') + 1, m.content.indexOf('?'));
                        uploadOb.field3content = m.content.substring(m.content.indexOf('?') + 1);
                        embed.addField(uploadOb.field3title, uploadOb.field3content);
                        break;
                    case 'thumnail':
                        uploadOb.thumnail = m.content.substring(m.content.indexOf('=') + 1);
                        embed.setThumbnail(uploadOb.thumnail);
                        break;
                    case 'tag':
                        tagString += m.content.substring(m.content.indexOf('=') + 1) + " ";
                        uploadOb.tag = tagString;
                        embed.setFooter(uploadOb.tag);
                        break;
                    case 'show':
                        message.channel.send(embed);
                        break;
                    case 'ok':
                        collector.stop();
                        Callback(null, uploadOb);
                        break;
                    case 'cancel':
                        collector.stop();
                        Callback("업로드 취소", uploadOb);
                        break;
                    default:
                        break;
                }
            });
        },
        function(arg, Callback){
            // 태그 작업 (존나 보기싫은 코드)
            var tagstring = uploadOb.tag;
            uploadOb.tag="0,"

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
                }

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
                            Callback(null, uploadOb);
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
                                Callback(null, uploadOb);
                            }
                            for(i = 0; i < tagArray.length; i++){
                                for(j = 0; j < rowstag.length; j++){
                                    if(rowstag[j].tag == tagArray[i]){
                                        // 일단 있는거 객체에 추가
                                        uploadOb.tag += rowstag[j].id + ","
                                    }
                                }
                            }

                            Callback(null, uploadOb);
                        });
                    })
                }else{
                    Callback(null, uploadOb);
                }
            })
        }
    ], function(err, result){
        console.log("업로드 요청");
        if(err != null){
            message.channel.send(err);
            return
        }
        //유효성검사
        if(typeof uploadOb.content == "undefined" || uploadOb.content == null || uploadOb.content == ""){
            uploadOb.content = ""
        }
        if(typeof uploadOb.field1title == "undefined" || uploadOb.field1title == null || uploadOb.field1title == ""){
            uploadOb.field1title = ""
        }
        if(typeof uploadOb.field1content == "undefined" || uploadOb.field1content == null || uploadOb.field1content == ""){
            uploadOb.field1content = ""
        }
        if(typeof uploadOb.field2title == "undefined" || uploadOb.field2title == null || uploadOb.field2title == ""){
            uploadOb.field2title = ""
        }
        if(typeof uploadOb.field2content == "undefined" || uploadOb.field2content == null || uploadOb.field2content == ""){
            uploadOb.field2content = ""
        }
        if(typeof uploadOb.field3title == "undefined" || uploadOb.field3title == null || uploadOb.field3title == ""){
            uploadOb.field3title = ""
        }
        if(typeof uploadOb.field3content == "undefined" || uploadOb.field3content == null || uploadOb.field3content == ""){
            uploadOb.field3content = ""
        }
        if(typeof uploadOb.ImageUrl == "undefined" || uploadOb.ImageUrl == null || uploadOb.ImageUrl == ""){
            uploadOb.ImageUrl = ""
        }
        if(typeof uploadOb.thumnail == "undefined" || uploadOb.thumnail == null || uploadOb.thumnail == ""){
            uploadOb.thumnail = ""
        }

        //엔터키 치환
        uploadOb.content = uploadOb.content.replace(/\n/g, '||');
        uploadOb.content = uploadOb.content.replace(/\r/g, '||');
        uploadOb.field1content = uploadOb.field1content.replace(/\n/g, '||');
        uploadOb.field1content = uploadOb.field1content.replace(/\r/g, '||');
        uploadOb.field2content = uploadOb.field2content.replace(/\n/g, '||');
        uploadOb.field2content = uploadOb.field2content.replace(/\r/g, '||');
        uploadOb.field3content = uploadOb.field3content.replace(/\n/g, '||');
        uploadOb.field3content = uploadOb.field3content.replace(/\r/g, '||');

        var sqlquery = "INSERT INTO attacktable(userid, title, content, fieldtitle1, fieldcontent1, fieldtitle2, fieldcontent2, fieldtitle3, fieldcontent3, attachfile, thumnail, tag, regdate, modate) ";
        sqlquery += "VALUES('" + message.author.id + "','" + uploadOb.title + "','" + uploadOb.content + "','";
        sqlquery += uploadOb.field1title + "','" + uploadOb.field1content + "','" + uploadOb.field2title + "','" + uploadOb.field2content + "','" + uploadOb.field3title + "','" + uploadOb.field3content + "','";
        sqlquery += uploadOb.ImageUrl + "', '" + uploadOb.thumnail + "', '" + uploadOb.tag + "', now(), now())";
        connection.query(sqlquery, function(err, result){
            if(!err){
                message.channel.send('업로드 완료!\n !'+uploadOb.title+' 통해 확인해주세요!');
            }else{
                message.channel.send('업로드 실패...b\n' + err);
            }
        })
    });
}


module.exports.uploadGuide = uploadGuide;